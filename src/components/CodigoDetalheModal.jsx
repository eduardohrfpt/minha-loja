import { createPortal } from 'react-dom'

function CodigoDetalheModal({ produtoNome, codigo, guiaUso, onFechar }) {
  // Este modal pode ser aberto de dentro de outro modal (ex: "Minhas compras"). Mesmo
  // portalizando pro <body>, o clique ainda borbulha pela árvore do React, não do DOM --
  // sem parar aqui, fechar este modal também fecharia o modal por trás dele.
  function fechar(e) {
    e.stopPropagation()
    onFechar()
  }

  return createPortal(
    <div className="overlay" onClick={fechar}>
      <div className="modal-status-pagamento" onClick={(e) => e.stopPropagation()}>
        <h2>{produtoNome}</h2>
        <div className="status-codigo">
          <span>Código de ativação</span>
          <code>{codigo}</code>
        </div>
        {guiaUso?.length > 0 && (
          <div className="detalhe-bloco">
            <h4>Como usar seu código</h4>
            <ol className="detalhe-lista-numerada">
              {guiaUso.map((passo, indice) => (
                <li key={indice}>{passo}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="acoes-formulario">
          <button className="botao-primario" onClick={fechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CodigoDetalheModal
