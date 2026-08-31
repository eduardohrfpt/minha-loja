import { stripe } from './_lib/stripe.js'
import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'

// A verificação de assinatura do Stripe precisa do corpo bruto da requisição,
// então desligamos o parse automático de JSON da Vercel.
export const config = {
  api: {
    bodyParser: false,
  },
}

function lerCorpoBruto(req) {
  return new Promise((resolve, reject) => {
    const pedacos = []
    req.on('data', (pedaco) => pedacos.push(pedaco))
    req.on('end', () => resolve(Buffer.concat(pedacos)))
    req.on('error', reject)
  })
}

// Eventos que sinalizam pagamento CONFIRMADO. Cartão confirma na hora (checkout.session.completed
// com payment_status "paid"); Pix é assíncrono e só confirma de fato quando chega
// checkout.session.async_payment_succeeded.
const EVENTOS_PAGAMENTO_CONFIRMADO = ['checkout.session.completed', 'checkout.session.async_payment_succeeded']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  let event
  try {
    const corpoBruto = await lerCorpoBruto(req)
    event = stripe.webhooks.constructEvent(corpoBruto, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Assinatura do webhook do Stripe inválida:', err.message)
    res.status(400).json({ error: `Webhook inválido: ${err.message}` })
    return
  }

  if (!EVENTOS_PAGAMENTO_CONFIRMADO.includes(event.type)) {
    res.status(200).json({ recebido: true })
    return
  }

  const session = event.data.object

  // Para checkout.session.completed com meio de pagamento assíncrono (Pix), o pagamento
  // ainda não foi confirmado nesse momento -- aguardamos o async_payment_succeeded.
  if (event.type === 'checkout.session.completed' && session.payment_status !== 'paid') {
    res.status(200).json({ recebido: true })
    return
  }

  const productId = session.metadata?.product_id
  const userId = session.metadata?.user_id

  if (!productId || !userId) {
    console.error('Sessão do Stripe sem metadata esperada:', session.id)
    res.status(200).json({ recebido: true })
    return
  }

  const supabaseAdmin = criarSupabaseAdmin()

  const { data, error } = await supabaseAdmin.rpc('resgatar_codigo_servidor', {
    p_product_id: productId,
    p_user_id: userId,
    p_stripe_session_id: session.id,
  })

  if (error) {
    console.error(`Falha ao entregar código da sessão ${session.id}:`, error.message)
    if (session.payment_intent) {
      try {
        await stripe.refunds.create({ payment_intent: session.payment_intent })
        console.error(`Estorno automático emitido para ${session.id} (sem estoque disponível).`)
      } catch (refundErr) {
        console.error(`Falha ao estornar automaticamente ${session.id}:`, refundErr.message)
      }
    }
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
