import { useRef } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

function avisoEmBreve() {
  alert('Sistema de contas em desenvolvimento 🚧')
}

function CtaFinal() {
  const containerRef = useRef(null)
  useScrollReveal(containerRef)

  return (
    <section className="cta-final" ref={containerRef}>
      <h2 data-reveal>Pronto pra economizar nas suas assinaturas?</h2>
      <p data-reveal>Crie sua conta gratuita e comece a comprar com desconto agora mesmo.</p>
      <button className="botao-cta-final" data-reveal onClick={avisoEmBreve}>
        Criar minha conta
      </button>
    </section>
  )
}

export default CtaFinal
