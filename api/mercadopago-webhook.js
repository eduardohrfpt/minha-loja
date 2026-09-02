import crypto from 'node:crypto'
import { mercadoPagoFetch } from './_lib/mercadopago.js'
import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { atualizarHistoricoPedido } from './_lib/historicoPedidos.js'

// Camada extra opcional: se MERCADOPAGO_WEBHOOK_SECRET estiver configurado (Painel do Mercado
// Pago > Sua aplicação > Webhooks > Chave secreta), valida a assinatura do header x-signature.
// Sem ela, a segurança do endpoint ainda depende de sempre rebuscar o pagamento direto na API
// do Mercado Pago abaixo (nunca confiamos no status que vem no corpo da notificação).
function assinaturaValida(req, paymentId) {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!segredo) return true

  const cabecalho = req.headers['x-signature']
  const requestId = req.headers['x-request-id']
  if (!cabecalho) return false

  const partes = Object.fromEntries(
    cabecalho.split(',').map((parte) => parte.trim().split('=').map((v) => v.trim())),
  )

  const manifest = `id:${paymentId};request-id:${requestId};ts:${partes.ts};`
  const hmac = crypto.createHmac('sha256', segredo).update(manifest).digest('hex')

  return hmac === partes.v1
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  // O Mercado Pago manda a notificação tanto por querystring (IPN legado) quanto por
  // corpo JSON (webhooks novos) -- aceitamos as duas formas.
  const tipo = req.query?.type || req.query?.topic || req.body?.type
  const paymentId = req.query?.['data.id'] || req.query?.id || req.body?.data?.id

  if (tipo !== 'payment' || !paymentId) {
    res.status(200).json({ recebido: true })
    return
  }

  // Só loga em caso de divergência -- não bloqueia a notificação. Essa checagem é uma camada
  // extra opcional (ver assinaturaValida acima); a segurança real vem do rebusca do pagamento
  // na API do Mercado Pago logo abaixo. Rejeitar aqui já causou notificações legítimas serem
  // descartadas por falso-negativo intermitente, atrasando a entrega do código ao cliente.
  if (!assinaturaValida(req, paymentId)) {
    console.warn(`Assinatura do webhook do Mercado Pago não confere para o pagamento ${paymentId} (seguindo mesmo assim).`)
  }

  let pagamento
  try {
    pagamento = await mercadoPagoFetch(`/v1/payments/${paymentId}`)
  } catch (err) {
    console.error(`Falha ao buscar pagamento ${paymentId} no Mercado Pago:`, err.message)
    res.status(200).json({ recebido: true })
    return
  }

  const [productId, userId, correlacao] = (pagamento.external_reference || '').split(':')
  const supabaseAdmin = criarSupabaseAdmin()

  if (pagamento.status === 'rejected' || pagamento.status === 'cancelled') {
    await atualizarHistoricoPedido(supabaseAdmin, correlacao, { status: 'falhou', payment_id: String(paymentId) })
    res.status(200).json({ recebido: true })
    return
  }

  if (pagamento.status !== 'approved') {
    res.status(200).json({ recebido: true })
    return
  }

  if (!productId || !userId) {
    console.error('Pagamento do Mercado Pago sem external_reference esperada:', paymentId)
    res.status(200).json({ recebido: true })
    return
  }

  const { data, error } = await supabaseAdmin.rpc('resgatar_codigo_servidor', {
    p_product_id: productId,
    p_user_id: userId,
    p_payment_id: String(paymentId),
    p_gateway: 'mercadopago',
  })

  if (error) {
    console.error(`Falha ao entregar código do pagamento ${paymentId}:`, error.message)
    // Pagamento aprovado, mas sem estoque no momento da entrega -- fica sem código no
    // histórico, o que sinaliza pro admin que esse caso precisa de atenção manual.
    await atualizarHistoricoPedido(supabaseAdmin, correlacao, { status: 'aprovado', payment_id: String(paymentId) })
    res.status(200).json({ recebido: true })
    return
  }

  const codigo = data?.[0]?.codigo
  if (!codigo) {
    res.status(200).json({ recebido: true })
    return
  }

  await atualizarHistoricoPedido(supabaseAdmin, correlacao, {
    status: 'aprovado',
    payment_id: String(paymentId),
    codigo,
  })

  const [{ data: userData }, { data: produto }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(userId),
    supabaseAdmin.from('products').select('name').eq('id', productId).single(),
  ])

  if (userData?.user?.email) {
    const origem = `https://${req.headers.host}`
    try {
      const respostaEmail = await fetch(`${origem}/api/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.user.email,
          nome: userData.user.user_metadata?.nome,
          produtoNome: produto?.name,
          codigo,
        }),
      })
      // fetch só rejeita em falha de rede -- um 4xx/5xx do Resend (ex: domínio de teste
      // resend.dev só pode mandar pro próprio e-mail da conta) passava batido sem log nenhum.
      if (!respostaEmail.ok) {
        const detalhe = await respostaEmail.text()
        console.error(`send-order-email retornou ${respostaEmail.status} para ${userData.user.email}:`, detalhe)
      }
    } catch (err) {
      console.error('Falha ao enviar e-mail de confirmação:', err)
    }
  }

  res.status(200).json({ recebido: true })
}
