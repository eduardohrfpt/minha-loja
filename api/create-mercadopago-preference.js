import { mercadoPagoFetch, ehAmbienteTeste } from './_lib/mercadopago.js'
import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { gerarCorrelacao, registrarPedidoPendente } from './_lib/historicoPedidos.js'

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
  const correlacao = gerarCorrelacao()

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
        // Formato compacto (não JSON). O terceiro campo (correlacao) identifica essa tentativa
        // de compra específica no historico_pedidos, pra o webhook saber qual linha atualizar.
        external_reference: `${produto.id}:${usuario.id}:${correlacao}`,
        notification_url: `${origem}/api/mercadopago-webhook`,
        // O Mercado Pago sempre acrescenta seus próprios parâmetros (payment_id, status, etc.)
        // na URL de retorno, então as três apontam pro mesmo lugar -- é o App.jsx que decide
        // o que mostrar com base nesses parâmetros.
        back_urls: {
          success: `${origem}/`,
          failure: `${origem}/`,
          pending: `${origem}/`,
        },
        // Só redireciona automaticamente pra pagamentos aprovados na hora (cartão). Pix e
        // boleto ficam pendentes na tela do Mercado Pago até o comprador voltar manualmente
        // ou o auto_return não se aplicar -- por isso o polling em App.jsx cobre os dois casos.
        auto_return: 'approved',
      }),
    })

    const url = ehAmbienteTeste() ? preferencia.sandbox_init_point : preferencia.init_point

    await registrarPedidoPendente(supabaseAdmin, {
      correlacao,
      userEmail: usuario.email,
      productName: produto.name,
      valor: produto.price,
      gateway: 'mercadopago',
    })

    res.status(200).json({ url })
  } catch (err) {
    console.error('Erro ao criar preferência no Mercado Pago:', err)
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' })
  }
}
