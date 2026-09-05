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
