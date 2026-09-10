import { useState } from 'react'
import { IconChevronDown } from './icons'

const perguntas = [
  {
    pergunta: 'Como sei que não vou perder meu dinheiro?',
    resposta:
      'A confirmação do pagamento é feita pelo Mercado Pago, e sua compra fica registrada em "Minhas compras". Se por algum motivo você não receber o código, devolvemos 100% do valor pago.',
  },
  {
    pergunta: 'É produto original? Posso ter problema com a conta depois?',
    resposta:
      'Sim, são assinaturas e licenças 100% originais, ativadas na sua própria conta. O que pode causar bloqueio é usar fora das regras da própria plataforma (compartilhar a conta, revender o acesso) — isso vale pra qualquer assinatura, comprada aqui ou direto no site oficial.',
  },
  {
    pergunta: 'Vocês guardam os dados do meu cartão?',
    resposta: 'Não. O pagamento acontece todo dentro do Mercado Pago — a gente nem vê o número do seu cartão.',
  },
  {
    pergunta: 'Quanto tempo demora pra chegar?',
    resposta:
      'Até 10 minutos após a confirmação do pagamento. Em dias de muita procura, esse prazo pode chegar a algumas horas.',
  },
  {
    pergunta: 'E se eu comprar e não funcionar?',
    resposta: 'É só chamar a gente pelo suporte. Resolvemos trocando o produto ou devolvendo seu dinheiro.',
  },
  {
    pergunta: 'Vocês vão me pedir minha senha do Google, ChatGPT ou outra plataforma?',
    resposta: 'Nunca. Se alguém pedir sua senha em nome da HRKeys, não é a gente — desconfie.',
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
        <h2>Dúvidas frequentes</h2>
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
