import { asaasFetch, obterOuCriarCliente } from './_lib/asaas.js'
import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'

function limparDocumento(valor) {
  return (valor || '').replace(/\D/g, '')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const { productId, cpfCnpj } = req.body || {}
  const documento = limparDocumento(cpfCnpj)

  if (!token) {
    res.status(401).json({ error: 'Você precisa entrar na sua conta para comprar.' })
    return
  }
  if (!productId) {
    res.status(400).json({ error: 'Produto inválido.' })
    return
  }
  if (documento.length !== 11 && documento.length !== 14) {
    res.status(400).json({ error: 'Informe um CPF ou CNPJ válido.' })
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

  try {
    const clienteId = await obterOuCriarCliente({
      nome: usuario.user_metadata?.nome || usuario.email,
      email: usuario.email,
      cpfCnpj: documento,
    })

    const vencimento = new Date()
    vencimento.setDate(vencimento.getDate() + 3)
    const dataVencimento = vencimento.toISOString().slice(0, 10)

    const cobranca = await asaasFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: clienteId,
        billingType: 'UNDEFINED',
        value: Number(produto.price),
        dueDate: dataVencimento,
        description: produto.name,
        // Formato compacto (não JSON): o Asaas limita externalReference a 100 caracteres,
        // e "{"product_id":"<uuid>","user_id":"<uuid>"}" já passa disso.
        externalReference: `${produto.id}:${usuario.id}`,
      }),
    })

    res.status(200).json({ url: cobranca.invoiceUrl })
  } catch (err) {
    console.error('Erro ao criar cobrança no Asaas:', err)
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' })
  }
}
