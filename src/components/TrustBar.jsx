import { IconTag, IconBolt, IconShield, IconHeadset } from './icons'

const itens = [
  { Icone: IconTag, texto: 'Preço de atacado' },
  { Icone: IconBolt, texto: 'Entrega imediata' },
  { Icone: IconShield, texto: 'Garantia de reembolso' },
  { Icone: IconHeadset, texto: 'Suporte humano' },
]

function TrustBar() {
  return (
    <section className="barra-confianca">
      {itens.map(({ Icone, texto }) => (
        <div className="barra-confianca-item" key={texto}>
          <Icone className="icone-confianca" />
          <span>{texto}</span>
        </div>
      ))}
    </section>
  )
}

export default TrustBar
