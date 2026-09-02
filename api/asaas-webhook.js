import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { atualizarHistoricoPedido } from './_lib/historicoPedidos.js'

// PAYMENT_CONFIRMED: pagamento confirmado (ex: cartão aprovado na hora).
// PAYMENT_RECEIVED: dinheiro efetivamente recebido (ex: Pix/boleto compensado).
const EVENTOS_PAGAMENTO_CONFIRMADO = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']

// PAYMENT_OVERDUE: Pix/boleto venceu sem ser pago. PAYMENT_DELETED: cobrança removida.
const EVENTOS_PAGAMENTO_FALHOU = ['PAYMENT_OVERDUE', 'PAYMENT_DELETED']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  // O Asaas não assina o payload como o Stripe; a autenticidade é garantida por um token
  // secreto configurado no painel do Asaas (Webhooks > Token de autenticação) e reenviado
  // neste header a cada chamada.
  const tokenRecebido = req.headers['asaas-access-token']
  if (!process.env.ASAAS_WEBHOOK_TOKEN || tokenRecebido !== process.env.ASAAS_WEBHOOK_TOKEN) {
    res.status(401).json({ error: 'Token de webhook inválido' })
    return
  }

  const { event, payment } = req.body || {}

  if (!payment || (!EVENTOS_PAGAMENTO_CONFIRMADO.includes(event) && !EVENTOS_PAGAMENTO_FALHOU.includes(event))) {
    res.status(200).json({ recebido: true })
    return
  }

  // Formato compacto "productId:userId:correlacao" (ver api/create-payment.js) -- o Asaas
  // limita externalReference a 100 caracteres, o que não cabe num JSON com esses dados.
  const [productId, userId, correlacao] = (payment.externalReference || '').split(':')
  const supabaseAdmin = criarSupabaseAdmin()

  if (EVENTOS_PAGAMENTO_FALHOU.includes(event)) {
    await atualizarHistoricoPedido(supabaseAdmin, correlacao, { status: 'falhou', payment_id: payment.id })
    res.status(200).json({ recebido: true })
    return
  }

  if (!productId || !userId) {
    console.error('Cobrança do Asaas sem externalReference esperada:', payment.id)
    res.status(200).json({ recebido: true })
    return
  }

  const { data, error } = await supabaseAdmin.rpc('resgatar_codigo_servidor', {
    p_product_id: productId,
    p_user_id: userId,
    p_payment_id: payment.id,
    p_gateway: 'asaas',
  })

  if (error) {
    // Sem estoque no momento da entrega (corrida rara entre criar a cobrança e o pagamento
    // ser confirmado). Diferente do Stripe, o Asaas não tem um endpoint único de estorno que
    // funcione para Pix, cartão e boleto ao mesmo tempo, então o reembolso aqui precisa ser
    // feito manualmente pelo painel do Asaas.
    console.error(`Falha ao entregar código do pagamento ${payment.id}:`, error.message)
    // Pagamento aprovado, mas sem estoque no momento da entrega -- fica sem código no
    // histórico, o que sinaliza pro admin que esse caso precisa de atenção manual.
    await atualizarHistoricoPedido(supabaseAdmin, correlacao, { status: 'aprovado', payment_id: payment.id })
    res.status(200).json({ recebido: true })
    return
  }

  const codigo = data?.[0]?.codigo
  if (!codigo) {
    res.status(200).json({ recebido: true })
    return
  }

  await atualizarHistoricoPedido(supabaseAdmin, correlacao, { status: 'aprovado', payment_id: payment.id, codigo })

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
