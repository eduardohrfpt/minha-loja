export function rolarPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// As seções (Produtos, Como funciona, Vantagens) só existem na Home. Fora dela, "rolar até"
// não acha o elemento e não faz nada -- então primeiro volta pra Home.
export function irParaSecao(location, navigate, id) {
  if (location.pathname !== '/') {
    navigate('/')
    return
  }
  rolarPara(id)
}

export function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Abre o chat do Tawk.to (widget fica escondido por padrão -- ver index.html). Se o script
// ainda não terminou de carregar, agenda a abertura pra rodar assim que ele ficar pronto.
export function abrirChatSuporte() {
  const tawk = window.Tawk_API
  if (!tawk) return

  const abrir = () => {
    tawk.showWidget?.()
    tawk.maximize?.()
  }

  if (typeof tawk.showWidget === 'function') {
    abrir()
    return
  }

  const onLoadAnterior = tawk.onLoad
  tawk.onLoad = function () {
    onLoadAnterior?.()
    abrir()
  }
}

// Esconde o chat do Tawk.to de volta. Chamada sempre que o cliente sai da tela de detalhes
// da compra (fecha o modal, troca de rota ou desloga) pra não deixar o widget aberto/visível
// fora daquele contexto.
export function esconderChatSuporte() {
  window.Tawk_API?.hideWidget?.()
}
