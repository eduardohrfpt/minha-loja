const beneficios = [
  {
    titulo: 'Até 70% mais barato',
    texto: 'Compramos em escala e repassamos a economia direto pra você, sem intermediário.',
  },
  {
    titulo: 'Ativação em minutos',
    texto: 'Assim que o pagamento é confirmado, seu código já está disponível.',
  },
  {
    titulo: 'Suporte via WhatsApp',
    texto: 'Gente de verdade te respondendo — sem fila de robô.',
  },
  {
    titulo: 'Garantia de 7 dias',
    texto: 'Não funcionou como esperado? Devolvemos seu dinheiro.',
  },
  {
    titulo: 'Pagamento protegido',
    texto: 'Checkout processado pelo Mercado Pago, de ponta a ponta.',
  },
  {
    titulo: 'Renovação sem dor de cabeça',
    texto: 'Quando chegar a hora, renovar leva um clique — sem perder seu histórico.',
  },
]

function V2WhyBuy() {
  return (
    <section id="vantagens" className="h-why">
      <div className="h-why-inner">
        <div className="h-why-cabecalho">
          <span className="h-eyebrow">
            <i className="h-eyebrow-dot" />
            Por que a HRKeys
          </span>
          <h2 className="h-why-titulo">Tudo pensado pra você assinar com tranquilidade</h2>
        </div>

        <ol className="h-why-lista">
          {beneficios.map(({ titulo, texto }, indice) => (
            <li className="h-why-item" key={titulo}>
              <span className="h-why-indice">{String(indice + 1).padStart(2, '0')}</span>
              <div className="h-why-texto">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default V2WhyBuy
