import { IconTag, IconBolt, IconShield, IconHeadset } from './v2icons'

const itens = [
  { Icone: IconTag, texto: 'Preço de atacado, direto pra você' },
  { Icone: IconBolt, texto: 'Entrega automática e imediata' },
  { Icone: IconShield, texto: 'Garantia de reembolso' },
  { Icone: IconHeadset, texto: 'Suporte humano de verdade' },
]

function V2TrustBar() {
  return (
    <section className="h-trust">
      <div className="h-trust-inner">
        {itens.map(({ Icone, texto }) => (
          <div className="h-trust-item" key={texto}>
            <Icone className="h-trust-icone" />
            <span>{texto}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default V2TrustBar
