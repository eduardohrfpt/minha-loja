import { formatarPreco, precoComDesconto, rolarPara } from '../utils'

function Hero({ produtosDestaque }) {
  return (
    <section id="topo" className="hero">
      <div className="hero-texto">
        <span className="etiqueta-eyebrow">Licenças originais, direto da fonte</span>
        <h1>Assinaturas premium por um preço muito mais baixo. Até 90% mais barato, aproveite!</h1>
        <p className="hero-subtitulo">
          Negociamos condições especiais com fornecedores autorizados para garantir os melhores
          preços. O produto é 100% original — a única diferença é que aqui você paga muito menos.
        </p>
        <div className="hero-acoes">
          <button className="botao-primario botao-grande" onClick={() => rolarPara('produtos')}>
            Ver produtos
          </button>
        </div>
      </div>

      <div className="hero-card">
        <span className="hero-card-selo">Economize até 30%</span>
        {produtosDestaque.map((produto) => {
          const precoFinal = precoComDesconto(produto.preco, produto.desconto)
          return (
            <div className="hero-card-item" key={produto.id}>
              <span className="hero-card-icone">{produto.imagem}</span>
              <div className="hero-card-info">
                <strong>{produto.nome}</strong>
                <span className="hero-card-marca">{produto.marca}</span>
              </div>
              <div className="hero-card-preco">
                {produto.desconto > 0 && (
                  <span className="preco-antigo">{formatarPreco(produto.preco)}</span>
                )}
                <span className="preco-final-pequeno">{formatarPreco(precoFinal)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Hero
