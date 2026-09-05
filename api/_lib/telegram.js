const BASE_URL = 'https://api.telegram.org/bot'

function formatarPrecoServidor(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function telegramFetch(metodo, corpo) {
  const resposta = await fetch(`${BASE_URL}${process.env.TELEGRAM_BOT_TOKEN}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok || !dados?.ok) {
    throw new Error(dados?.description || `Erro na API do Telegram (${metodo}, ${resposta.status})`)
  }

  return dados.result
}

// Avisa o admin de um pedido de entrega manual. Devolve o message_id da notificação, que fica
// salvo em orders.telegram_message_id pra identificar depois qual pedido é a resposta (reply).
export async function enviarNotificacaoPedido({ orderId, produtoNome, email, valor }) {
  const texto = [
    '🛒 *Novo pedido — entrega manual*',
    '',
    `*Produto:* ${produtoNome}`,
    `*Cliente:* ${email}`,
    `*Valor:* ${formatarPrecoServidor(valor)}`,
    `*Pedido:* \`${orderId}\``,
    '',
    '⏱ Entregar em até *10 minutos*. Responda esta mensagem (reply) com a chave/link de ativação.',
  ].join('\n')

  const mensagem = await telegramFetch('sendMessage', {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: texto,
    parse_mode: 'Markdown',
  })

  return mensagem.message_id
}

export async function responderNoTelegram(texto) {
  await telegramFetch('sendMessage', {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: texto,
  })
}
