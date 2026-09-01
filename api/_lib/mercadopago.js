const BASE_URL = 'https://api.mercadopago.com'

// Tokens de teste do Mercado Pago sempre começam com "TEST-"; os de produção com "APP_USR-".
export function ehAmbienteTeste() {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-')
}

export async function mercadoPagoFetch(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      ...(opcoes.headers || {}),
    },
  })

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const mensagem = dados?.message || dados?.error || `Erro na API do Mercado Pago (${resposta.status})`
    throw new Error(mensagem)
  }

  return dados
}
