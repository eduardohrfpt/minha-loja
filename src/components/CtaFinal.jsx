function avisoEmBreve() {
  alert('Sistema de contas em desenvolvimento 🚧')
}

function CtaFinal() {
  return (
    <section className="cta-final">
      <h2>Pronto pra economizar nas suas assinaturas?</h2>
      <p>Crie sua conta gratuita e comece a comprar com desconto agora mesmo.</p>
      <button className="botao-cta-final" onClick={avisoEmBreve}>
        Criar minha conta
      </button>
    </section>
  )
}

export default CtaFinal
