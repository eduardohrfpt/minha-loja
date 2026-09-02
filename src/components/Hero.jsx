import { formatarPreco, rolarPara } from '../utils'

function Hero({ produtosDestaque }) {
  return (
    <section id="topo" className="hero">
      <div className="hero-texto">
        <span className="banner-destaque">Economize até 90% em assinaturas premium</span>
        <h1>
          Assinaturas premium por um preço muito mais baixo. Acesso legítimo às plataformas
          originais, com um desconto de até 90%. Aproveite!
        </h1>
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
        {produtosDestaque.map((produto) => (
          <div className="hero-card-item" key={produto.id}>
            <span className="hero-card-icone">{produto.image}</span>
            <div className="hero-card-info">
              <strong>{produto.name}</strong>
              <span className="hero-card-marca">{produto.brand}</span>
            </div>
            <div className="hero-card-preco">
              {produto.discount > 0 && (
                <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
              )}
              <span className="preco-final-pequeno">{formatarPreco(produto.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Hero
