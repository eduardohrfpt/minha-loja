import { criarSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { responderNoTelegram } from './_lib/telegram.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  // Telegram reenvia esse header exatamente como configurado no setWebhook (secret_token).
  // É a única forma de confirmar que a chamada realmente veio do Telegram.
  const tokenRecebido = req.headers['x-telegram-bot-api-secret-token']
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || tokenRecebido !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Token de webhook inválido' })
    return
  }

  const mensagem = req.body?.message

  // Só reage a resposta (reply) dentro do chat configurado como admin -- ignora qualquer outra
  // mensagem (inclusive de terceiros que eventualmente falem com o bot).
  if (
    !mensagem?.reply_to_message ||
    !mensagem?.text ||
    String(mensagem.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)
  ) {
    res.status(200).json({ ok: true })
    return
  }

  const supabaseAdmin = criarSupabaseAdmin()

  const { data: pedido, error: erroPedido } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, product_id, status, payment_id, products(name)')
    .eq('telegram_message_id', mensagem.reply_to_message.message_id)
    .maybeSingle()

  if (erroPedido || !pedido) {
    res.status(200).json({ ok: true })
    return
  }

  // Já entregue (reenvio do Telegram, ou resposta duplicada) -- não sobrescreve a chave.
  if (pedido.status === 'entregue') {
    res.status(200).json({ ok: true })
    return
  }

  const codigo = mensagem.text.trim()

  const { error: erroCodigo } = await supabaseAdmin.from('codigos_produto').insert({
    product_id: pedido.product_id,
    codigo,
    usado: true,
    order_id: pedido.id,
  })

  if (erroCodigo) {
    console.error(`Falha ao salvar código manual do pedido ${pedido.id}:`, erroCodigo.message)
    await responderNoTelegram(`⚠️ Não consegui salvar a chave do pedido ${pedido.id}. Tenta de novo?`)
    res.status(200).json({ ok: true })
    return
  }

  await supabaseAdmin.from('orders').update({ status: 'entregue' }).eq('id', pedido.id)

  // Best-effort: atualiza o registro de suporte (tela "Pedidos" do admin) com a chave também.
  if (pedido.payment_id) {
    await supabaseAdmin.from('historico_pedidos').update({ codigo }).eq('payment_id', pedido.payment_id)
  }

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(pedido.user_id)
  const email = userData?.user?.email

  if (email) {
    const origem = `https://${req.headers.host}`
    try {
      await fetch(`${origem}/api/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome: userData.user.user_metadata?.nome,
          produtoNome: pedido.products?.name,
          codigo,
        }),
      })
    } catch (err) {
      console.error('Falha ao enviar e-mail de confirmação (entrega manual):', err)
    }
  }

  await responderNoTelegram(`✅ Chave entregue para ${email || 'cliente'} - ${pedido.products?.name || 'produto'}`)

  res.status(200).json({ ok: true })
}
