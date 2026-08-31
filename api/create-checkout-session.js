import { stripe } from './_lib/stripe.js'
import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const { productId } = req.body || {}

  if (!token) {
    res.status(401).json({ error: 'Você precisa entrar na sua conta para comprar.' })
    return
  }
  if (!productId) {
    res.status(400).json({ error: 'Produto inválido.' })
    return
  }

  const supabaseAdmin = criarSupabaseAdmin()

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Sessão expirada. Entre novamente na sua conta.' })
    return
  }
  const usuario = userData.user

  const { data: produto, error: produtoError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, available')
    .eq('id', productId)
    .single()

  if (produtoError || !produto) {
    res.status(404).json({ error: 'Produto não encontrado.' })
    return
  }

  const { data: estoqueRow } = await supabaseAdmin
    .from('estoque_disponivel')
    .select('disponivel')
    .eq('product_id', productId)
    .maybeSingle()

  const disponivel = estoqueRow?.disponivel || 0
  if (!produto.available || disponivel <= 0) {
    res.status(409).json({ error: 'Este produto está esgotado no momento.' })
    return
  }

  const origem = req.headers.origin || `https://${req.headers.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix'],
      customer_email: usuario.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(Number(produto.price) * 100),
            product_data: { name: produto.name },
          },
        },
      ],
      payment_method_options: {
        pix: { expires_after_seconds: 3600 },
      },
      metadata: {
        product_id: produto.id,
        user_id: usuario.id,
      },
      success_url: `${origem}/?checkout=sucesso`,
      cancel_url: `${origem}/?checkout=cancelado`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err)
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' })
  }
}
