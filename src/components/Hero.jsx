import { useRef, useState } from 'react'
import { formatarPreco, rolarPara } from '../utils'
import IconeProduto from './IconeProduto'
import AuthModal from './AuthModal'
import { useScrollReveal } from '../hooks/useScrollReveal'

function Hero({ produtosDestaque }) {
  const [modalAberto, setModalAberto] = useState(false)
  const containerRef = useRef(null)
  useScrollReveal(containerRef)

  return (
    <section id="topo" className="hero-secao" ref={containerRef}>
      <div className="hero">
        <div className="hero-texto">
          <span className="banner-destaque" data-reveal>
            Economize até 90% em assinaturas premium
          </span>
          <h1 data-reveal>Assinaturas premium por um preço muito mais baixo.</h1>
          <p className="hero-destaque" data-reveal>
            Acesso legítimo às plataformas originais, com desconto de até 90%.
          </p>
          <p className="hero-subtitulo" data-reveal>
            Compramos em dólar e em grande quantidade, o que garante os melhores preços — e
            repassamos essa vantagem a você. O produto é 100% original, a única diferença é o
            preço. Entrega rápida após a confirmação do pagamento.
          </p>
          <div className="hero-acoes" data-reveal>
            <button className="botao-primario botao-grande" onClick={() => rolarPara('produtos')}>
              Ver produtos
            </button>
            <button className="botao-secundario botao-grande" onClick={() => setModalAberto(true)}>
              Criar conta grátis
            </button>
          </div>
        </div>

        <div className="hero-card" data-reveal>
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
