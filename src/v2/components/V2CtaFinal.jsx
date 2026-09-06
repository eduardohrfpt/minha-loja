import { useState } from 'react'
import V2AuthModal from './V2AuthModal'

function V2CtaFinal() {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <section className="h-cta">
      <div className="h-cta-inner">
        <span className="h-eyebrow h-eyebrow--claro">
          <i className="h-eyebrow-dot" />
          Pronto pra economizar?
        </span>
        <h2 className="h-cta-titulo">Sua próxima assinatura, pelo preço que ela deveria custar.</h2>
        <p className="h-cta-texto">
          Criar conta é grátis e leva menos de um minuto. O desconto já está te esperando no catálogo.
        </p>
        <button className="h-botao h-botao--claro" onClick={() => setModalAberto(true)}>
          Criar minha conta grátis
        </button>
      </div>

      {modalAberto && <V2AuthModal modoInicial="cadastro" onFechar={() => setModalAberto(false)} />}
    </section>
  )
}

export default V2CtaFinal
