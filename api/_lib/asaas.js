const BASE_URL_SANDBOX = 'https://api-sandbox.asaas.com/v3'
const BASE_URL_PRODUCAO = 'https://api.asaas.com/v3'

function baseUrl() {
  return process.env.ASAAS_ENV === 'production' ? BASE_URL_PRODUCAO : BASE_URL_SANDBOX
}

export async function asaasFetch(caminho, opcoes = {}) {
  const resposta = await fetch(`${baseUrl()}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      access_token: process.env.ASAAS_API_KEY,
      ...(opcoes.headers || {}),
    },
  })

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const mensagem = dados?.errors?.[0]?.description || `Erro na API do Asaas (${resposta.status})`
    throw new Error(mensagem)
  }

  return dados
}

// Reaproveita o cliente do Asaas pelo CPF/CNPJ em vez de criar um duplicado a cada compra.
export async function obterOuCriarCliente({ nome, email, cpfCnpj }) {
  const busca = await asaasFetch(`/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`)
  if (busca?.data?.length > 0) {
    return busca.data[0].id
  }

  const novoCliente = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({ name: nome, email, cpfCnpj }),
  })

  return novoCliente.id
}
