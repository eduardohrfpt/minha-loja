import { useState } from 'react'

const perguntas = [
  {
    pergunta: 'As licenças são realmente originais?',
    resposta:
      'Sim. Compramos planos oficiais diretamente das plataformas e repassamos o acesso pra você — nada de crack, chave pirata ou conta compartilhada.',
  },
  {
    pergunta: 'Em quanto tempo recebo meu acesso?',
    resposta: 'A ativação é imediata para a maioria dos produtos, assim que o pagamento é confirmado.',
  },
  {
    pergunta: 'E se eu não gostar? Como funciona a garantia?',
    resposta: 'Você tem 7 dias corridos após a compra para solicitar reembolso caso não fique satisfeito.',
  },
  {
    pergunta: 'Quais formas de pagamento vocês aceitam?',
    resposta: 'Cartão de crédito, Pix e boleto, com confirmação processada de forma segura pelo Mercado Pago.',
  },
  {
    pergunta: 'Existe fidelidade ou posso cancelar quando quiser?',
    resposta: 'Não há fidelidade nenhuma. Você cancela a renovação a qualquer momento pela sua conta.',
  },
]

function V2Faq() {
  const [aberta, setAberta] = useState(null)

  function alternar(indice) {
    setAberta((atual) => (atual === indice ? null : indice))
  }

  return (
    <section className="h-faq">
      <div className="h-faq-inner">
        <div className="h-faq-cabecalho">
          <span className="h-eyebrow">
            <i className="h-eyebrow-dot" />
            Dúvidas frequentes
          </span>
          <h2 className="h-faq-titulo">Perguntas que a gente sempre recebe</h2>
        </div>

        <div className="h-faq-lista">
          {perguntas.map((item, indice) => {
            const estaAberta = aberta === indice
            return (
              <div className={`h-faq-item ${estaAberta ? 'h-faq-item--aberta' : ''}`} key={item.pergunta}>
                <button className="h-faq-pergunta" onClick={() => alternar(indice)}>
                  <span className="h-faq-numero">{String(indice + 1).padStart(2, '0')}</span>
                  <span className="h-faq-texto">{item.pergunta}</span>
                  <span className="h-faq-toggle" aria-hidden="true">
                    {estaAberta ? '−' : '+'}
                  </span>
                </button>
                {estaAberta && <p className="h-faq-resposta">{item.resposta}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default V2Faq
