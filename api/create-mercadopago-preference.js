import { mercadoPagoFetch, ehAmbienteTeste } from './_lib/mercadopago.js'
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
    const preferencia = await mercadoPagoFetch('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            title: produto.name,
            quantity: 1,
            unit_price: Number(produto.price),
            currency_id: 'BRL',
          },
        ],
        payer: { email: usuario.email },
        // Formato compacto (não JSON), consistente com o que já é usado na integração Asaas.
        external_reference: `${produto.id}:${usuario.id}`,
        notification_url: `${origem}/api/mercadopago-webhook`,
        back_urls: {
          success: `${origem}/?pagamento=sucesso`,
          failure: `${origem}/?pagamento=falha`,
          pending: `${origem}/?pagamento=pendente`,
        },
        auto_return: 'approved',
      }),
    })

    const url = ehAmbienteTeste() ? preferencia.sandbox_init_point : preferencia.init_point

    res.status(200).json({ url })
  } catch (err) {
    console.error('Erro ao criar preferência no Mercado Pago:', err)
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' })
  }
}
