import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'

// PAYMENT_CONFIRMED: pagamento confirmado (ex: cartão aprovado na hora).
// PAYMENT_RECEIVED: dinheiro efetivamente recebido (ex: Pix/boleto compensado).
const EVENTOS_PAGAMENTO_CONFIRMADO = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']

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

  if (!EVENTOS_PAGAMENTO_CONFIRMADO.includes(event) || !payment) {
    res.status(200).json({ recebido: true })
    return
  }

  let referencia = {}
  try {
    referencia = JSON.parse(payment.externalReference || '{}')
  } catch {
    referencia = {}
  }

  const { product_id: productId, user_id: userId } = referencia

  if (!productId || !userId) {
    console.error('Cobrança do Asaas sem externalReference esperada:', payment.id)
    res.status(200).json({ recebido: true })
    return
  }

  const supabaseAdmin = criarSupabaseAdmin()

  const { data, error } = await supabaseAdmin.rpc('resgatar_codigo_servidor', {
    p_product_id: productId,
    p_user_id: userId,
    p_payment_id: payment.id,
  })

  if (error) {
    // Sem estoque no momento da entrega (corrida rara entre criar a cobrança e o pagamento
    // ser confirmado). Diferente do Stripe, o Asaas não tem um endpoint único de estorno que
    // funcione para Pix, cartão e boleto ao mesmo tempo, então o reembolso aqui precisa ser
    // feito manualmente pelo painel do Asaas.
    console.error(`Falha ao entregar código do pagamento ${payment.id}:`, error.message)
    res.status(200).json({ recebido: true })
    return
  }

  const codigo = data?.[0]?.codigo
  if (!codigo) {
    res.status(200).json({ recebido: true })
    return
  }

  const [{ data: userData }, { data: produto }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(userId),
    supabaseAdmin.from('products').select('name').eq('id', productId).single(),
  ])

  if (userData?.user?.email) {
    const origem = `https://${req.headers.host}`
    try {
      await fetch(`${origem}/api/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.user.email,
          nome: userData.user.user_metadata?.nome,
          produtoNome: produto?.name,
          codigo,
        }),
      })
    } catch (err) {
      console.error('Falha ao enviar e-mail de confirmação:', err)
    }
  }

  res.status(200).json({ recebido: true })
}
