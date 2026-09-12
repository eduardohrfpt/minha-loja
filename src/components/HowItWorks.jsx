import { useRef } from 'react'
import { IconUserPlus, IconPackage, IconBolt } from './icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

const passos = [
  { Icone: IconUserPlus, titulo: 'Crie sua conta', texto: 'Cadastro rápido, sem burocracia.' },
  { Icone: IconPackage, titulo: 'Escolha o produto', texto: 'Selecione a assinatura que você precisa.' },
  { Icone: IconBolt, titulo: 'Receba na hora', texto: 'Ativação e acesso imediatos após a compra.' },
]

function HowItWorks() {
  const containerRef = useRef(null)
  useScrollReveal(containerRef)

  return (
    <section id="como-funciona" className="secao secao-alt" ref={containerRef}>
      <div className="secao-cabecalho" data-reveal>
        <h2>Como funciona</h2>
        <p>Três passos simples entre você e sua próxima assinatura.</p>
      </div>

      <div className="passos">
        {passos.map(({ Icone, titulo, texto }, indice) => (
          <div className="passo" key={titulo} data-reveal>
            <div className="passo-numero">{indice + 1}</div>
            <Icone className="passo-icone" />
            <h3>{titulo}</h3>
            <p>{texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
