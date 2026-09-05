import { useState } from 'react'
import { formatarPreco, rolarPara } from '../utils'
import IconeProduto from './IconeProduto'
import AuthModal from './AuthModal'

function Hero({ produtosDestaque }) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <section id="topo" className="hero-secao">
      <div className="hero">
        <div className="hero-texto">
          <span className="banner-destaque">Economize até 90% em assinaturas premium</span>
          <h1>Assinaturas premium por um preço muito mais baixo.</h1>
          <p className="hero-destaque">Acesso legítimo às plataformas originais, com um desconto de até 90%. Aproveite!</p>
          <p className="hero-subtitulo">
            Negociamos condições especiais com fornecedores autorizados para garantir os melhores
            preços. O produto é 100% original — a única diferença é que aqui você paga muito menos.
          </p>
          <div className="hero-acoes">
            <button className="botao-primario botao-grande" onClick={() => rolarPara('produtos')}>
              Ver produtos
            </button>
            <button className="botao-secundario botao-grande" onClick={() => setModalAberto(true)}>
              Criar conta grátis
            </button>
          </div>
        </div>

        <div className="hero-card">
          <span className="hero-card-selo">Economize até 90%</span>
          <div className="hero-card-cabecalho">
            <strong>Seus produtos</strong>
            <span>Entrega em até 10 minutos</span>
          </div>
          {produtosDestaque.map((produto) => (
            <div className="hero-card-item" key={produto.id}>
              <IconeProduto produto={produto} className="hero-card-icone" />
              <div className="hero-card-info">
                <strong>{produto.name}</strong>
                <span className="hero-card-marca">{produto.brand}</span>
              </div>
              <div className="hero-card-preco">
                {produto.discount > 0 && (
                  <div className="precos-linha">
                    <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
                    <span className="etiqueta-desconto">-{produto.discount}%</span>
                  </div>
                )}
                <span className="preco-final-pequeno">{formatarPreco(produto.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalAberto && <AuthModal modoInicial="cadastro" onFechar={() => setModalAberto(false)} />}
    </section>
  )
}

export default Hero
