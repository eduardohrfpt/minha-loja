import { IconTag, IconBolt, IconHeadset, IconLock, IconRefresh, IconShield } from './icons'

const beneficios = [
  { Icone: IconTag, titulo: 'Até 70% mais barato', texto: 'Compra no atacado repassada direto pra você.' },
  { Icone: IconBolt, titulo: 'Ativação em minutos', texto: 'Sem espera, seu acesso liberado na hora.' },
  { Icone: IconHeadset, titulo: 'Suporte via WhatsApp', texto: 'Atendimento humano, sem robôs enrolando.' },
  { Icone: IconShield, titulo: 'Garantia de 7 dias', texto: 'Não gostou? Devolvemos seu dinheiro.' },
  { Icone: IconLock, titulo: 'Pagamento seguro', texto: 'Transações protegidas de ponta a ponta.' },
  { Icone: IconRefresh, titulo: 'Renovação facilitada', texto: 'Renove com um clique, sem perder o acesso.' },
]

function WhyBuy() {
  return (
    <section id="vantagens" className="secao secao-alt">
      <div className="secao-cabecalho">
        <h2>Por que comprar com a gente</h2>
        <p>Tudo o que você precisa pra assinar com tranquilidade.</p>
      </div>

      <div className="beneficios">
        {beneficios.map(({ Icone, titulo, texto }) => (
          <div className="beneficio" key={titulo}>
            <div className="icone-circulo">
              <Icone />
            </div>
            <h3>{titulo}</h3>
            <p>{texto}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhyBuy
