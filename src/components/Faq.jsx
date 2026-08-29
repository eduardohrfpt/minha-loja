import { useState } from 'react'
import { IconChevronDown } from './icons'

const perguntas = [
  {
    pergunta: 'As licenças são originais?',
    resposta: 'Sim. Compramos planos oficiais diretamente das plataformas e repassamos o acesso pra você.',
  },
  {
    pergunta: 'Em quanto tempo recebo meu acesso?',
    resposta: 'A ativação é imediata para a maioria dos produtos, assim que o pagamento é confirmado.',
  },
  {
    pergunta: 'Como funciona a garantia de reembolso?',
    resposta: 'Você tem 7 dias corridos após a compra para solicitar reembolso caso não fique satisfeito.',
  },
  {
    pergunta: 'Quais formas de pagamento vocês aceitam?',
    resposta: 'Cartão de crédito, Pix e boleto, com confirmação processada de forma segura.',
  },
  {
    pergunta: 'Posso cancelar minha assinatura quando quiser?',
    resposta: 'Sim, não há fidelidade. Você cancela a renovação a qualquer momento pela sua conta.',
  },
]

function Faq() {
  const [aberta, setAberta] = useState(null)

  function alternar(indice) {
    setAberta((atual) => (atual === indice ? null : indice))
  }

  return (
    <section className="secao secao-estreita">
      <div className="secao-cabecalho">
        <h2>Perguntas frequentes</h2>
      </div>

      <div className="faq">
        {perguntas.map((item, indice) => (
          <div className="faq-item" key={item.pergunta}>
            <button className="faq-pergunta" onClick={() => alternar(indice)}>
              <span>{item.pergunta}</span>
              <IconChevronDown className={`faq-seta ${aberta === indice ? 'aberta' : ''}`} />
            </button>
            {aberta === indice && <p className="faq-resposta">{item.resposta}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Faq
