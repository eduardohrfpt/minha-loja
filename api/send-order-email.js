export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const { email, nome, produtoNome, codigo } = req.body || {}

  if (!email || !produtoNome || !codigo) {
    res.status(400).json({ error: 'Dados incompletos' })
    return
  }

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HRKeys <contato@hrkeys.com.br>',
        to: [email],
        subject: `Sua compra: ${produtoNome}`,
        html: `
          <p>Olá${nome ? ' ' + nome : ''},</p>
          <p>Sua compra de <strong>${produtoNome}</strong> foi confirmada.</p>
          <p>Seu código: <strong>${codigo}</strong></p>
          <p>Obrigado por comprar com a HRKeys.</p>
        `,
      }),
    })

    if (!resposta.ok) {
      const detalhes = await resposta.text()
      res.status(502).json({ error: detalhes })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
