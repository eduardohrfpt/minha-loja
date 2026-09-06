import { IconUserPlus, IconPackage, IconBolt } from './v2icons'

const passos = [
  {
    Icone: IconUserPlus,
    numero: '01',
    titulo: 'Crie sua conta',
    texto: 'Cadastro rápido, sem burocracia — só o essencial pra liberar seu acesso.',
  },
  {
    Icone: IconPackage,
    numero: '02',
    titulo: 'Escolha sua assinatura',
    texto: 'Navegue pelo catálogo e veja exatamente o que está incluso antes de comprar.',
  },
  {
    Icone: IconBolt,
    numero: '03',
    titulo: 'Ative na hora',
    texto: 'Pagamento aprovado, código liberado. Sem espera, sem enrolação.',
  },
]

function V2HowItWorks() {
  return (
    <section id="como-funciona" className="h-how">
      <div className="h-how-inner">
        <div className="h-how-cabecalho">
          <span className="h-eyebrow h-eyebrow--claro">
            <i className="h-eyebrow-dot" />
            Como funciona
          </span>
          <h2 className="h-how-titulo">Três passos entre você e sua próxima assinatura</h2>
        </div>

        <div className="h-how-linha">
          {passos.map(({ Icone, numero, titulo, texto }) => (
            <div className="h-how-passo" key={numero}>
              <span className="h-how-numero">{numero}</span>
              <Icone className="h-how-icone" />
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default V2HowItWorks
