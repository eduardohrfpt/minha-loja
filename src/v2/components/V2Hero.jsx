import { useState } from 'react'
import { formatarPreco } from '../../utils'
import IconeProduto from '../../components/IconeProduto'
import V2AuthModal from './V2AuthModal'
import { IconBolt } from './v2icons'

function rolarParaProdutos() {
  document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })
}

// Identidade visual exclusiva da Home da v2 (classes com prefixo "h-"): tipografia geométrica
// + mono, paleta tinta/azul-cobalto, layout editorial com hairlines. Isolada de propósito das
// classes "v2-" usadas pelo restante da v2 (catálogo, modais, header, footer), que não mudam.
function V2Hero({ produtosDestaque }) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <section id="topo" className="h-hero">
      <div className="h-hero-inner">
        <div className="h-hero-main">
          <span className="h-eyebrow">
            <i className="h-eyebrow-dot" />
            Assinaturas originais — até 90% de desconto
          </span>
          <h1 className="h-hero-title">
            Acesso premium.
            <br />
            <span className="h-hero-title-accent">Preço real.</span>
          </h1>
          <p className="h-hero-lead">
            A HRKeys compra assinaturas em escala e repassa o desconto direto pra você. Sem
            atalho, sem gambiarra: produto 100% original, na sua própria conta — só o preço que
            muda.
          </p>
          <div className="h-hero-actions">
            <button className="h-botao h-botao--ink" onClick={rolarParaProdutos}>
              Ver catálogo
            </button>
            <button className="h-botao h-botao--linha" onClick={() => setModalAberto(true)}>
              Criar conta grátis
            </button>
          </div>
          <p className="h-hero-meta">
            <IconBolt />
            Entrega em minutos após a confirmação do pagamento
          </p>
        </div>

        <aside className="h-hero-panel">
          <div className="h-hero-panel-head">
            <span>Em alta agora</span>
            <span className="h-hero-panel-tag">Preço de atacado</span>
          </div>
          <ul className="h-hero-panel-list">
            {produtosDestaque.map((produto) => (
              <li className="h-hero-panel-item" key={produto.id}>
                <IconeProduto produto={produto} className="h-hero-panel-icone" />
                <div className="h-hero-panel-info">
                  <strong>{produto.name}</strong>
                  <span>{produto.brand}</span>
                </div>
                <div className="h-hero-panel-preco">
                  {produto.discount > 0 && (
                    <span className="h-riscado">{formatarPreco(produto.original_price)}</span>
                  )}
                  <span className="h-mono-preco">{formatarPreco(produto.price)}</span>
                </div>
              </li>
            ))}
            {produtosDestaque.length === 0 && <li className="h-hero-panel-vazio">Catálogo sendo preparado.</li>}
          </ul>
        </aside>
      </div>

      {modalAberto && <V2AuthModal modoInicial="cadastro" onFechar={() => setModalAberto(false)} />}
    </section>
  )
}

export default V2Hero
