import crypto from 'node:crypto'

// Token curto (não um uuid) porque ele viaja embutido no external_reference/externalReference
// enviado pro gateway de pagamento, e o Asaas limita esse campo a 100 caracteres.
export function gerarCorrelacao() {
  return crypto.randomBytes(8).toString('hex')
}

// Best-effort: uma falha aqui nunca deve interromper o checkout do cliente, só faz a tela
// "Pedidos" do admin ficar sem esse registro.
export async function registrarPedidoPendente(supabaseAdmin, { correlacao, userEmail, productName, valor, gateway }) {
  const { error } = await supabaseAdmin.from('historico_pedidos').insert({
    correlacao,
    user_email: userEmail,
    product_name: productName,
    valor,
    gateway,
  })

  if (error) {
    console.error('Falha ao registrar pedido pendente no histórico:', error.message)
  }
}

// Também best-effort: nunca deve interromper a entrega do código nem o envio do e-mail.
export async function atualizarHistoricoPedido(supabaseAdmin, correlacao, dados) {
  if (!correlacao) return

  const { error } = await supabaseAdmin
    .from('historico_pedidos')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('correlacao', correlacao)

  if (error) {
    console.error('Falha ao atualizar histórico de pedidos:', error.message)
  }
}
