import { createPortal } from 'react-dom'

function V2CodigoDetalheModal({ produtoNome, codigo, guiaUso, onFechar }) {
  // Este modal pode ser aberto de dentro de outro modal (ex: "Minhas compras"). Mesmo
  // portalizando pro <body>, o clique ainda borbulha pela árvore do React -- sem parar aqui,
  // fechar este modal também fecharia o modal por trás dele.
  function fechar(e) {
    e.stopPropagation()
    onFechar()
  }

  return createPortal(
    <div className="v2-shell v2-overlay" onClick={fechar}>
      <div className="v2-modal v2-modal--estreito" onClick={(e) => e.stopPropagation()}>
        <h2>{produtoNome}</h2>
        <div className="v2-bloco-codigo">
          <span>Código de ativação</span>
          <code>{codigo}</code>
        </div>
        {guiaUso?.length > 0 && (
          <div className="v2-detalhe-bloco">
            <h4>Como usar seu código</h4>
            <ol className="v2-lista-numerada">
              {guiaUso.map((passo, indice) => (
                <li key={indice}>{passo}</li>
              ))}
            </ol>
          </div>
        )}
        <button className="v2-botao v2-botao--ouro v2-botao--bloco" onClick={fechar}>
          Fechar
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default V2CodigoDetalheModal
