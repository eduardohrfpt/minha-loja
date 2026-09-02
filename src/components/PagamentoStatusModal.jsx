import { createPortal } from 'react-dom'

function PagamentoStatusModal({ estado, produtoNome, codigo, guiaUso, onFechar }) {
  const podeFechar = estado !== 'confirmando'

  return createPortal(
    <div className="overlay" onClick={podeFechar ? onFechar : undefined}>
      <div className="modal-status-pagamento" onClick={(e) => e.stopPropagation()}>
        {estado === 'confirmando' && (
          <>
            <div className="spinner-pagamento" aria-hidden="true" />
            <h2>Confirmando seu pagamento...</h2>
            <p className="detalhe-texto-livre">
              Isso pode levar alguns segundos. Se você pagou por Pix, aguarde aqui mesmo — assim que a confirmação
              chegar, mostramos seu código automaticamente.
            </p>
          </>
        )}

        {estado === 'sucesso' && (
          <>
            <span className="status-icone status-icone-ok" aria-hidden="true">
              ✓
            </span>
            <h2>Pagamento aprovado!</h2>
            {produtoNome && <p className="detalhe-texto-livre">{produtoNome}</p>}
            <div className="status-codigo">
              <span>Seu código de ativação</span>
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
            <p className="detalhe-texto-livre detalhe-texto-pequeno">
              Também enviamos esse código para o seu e-mail. Ele fica disponível em "Minhas compras" a qualquer
              momento.
            </p>
            <div className="acoes-formulario">
              <button className="botao-primario" onClick={onFechar}>
                Fechar
              </button>
            </div>
          </>
        )}

        {estado === 'expirado' && (
          <>
            <h2>Ainda estamos confirmando seu pagamento</h2>
            <p className="detalhe-texto-livre">
              Pagamentos via Pix às vezes demoram um pouco mais para compensar. Assim que for aprovado, enviaremos o
              código por e-mail e ele também vai aparecer em "Minhas compras".
            </p>
            <div className="acoes-formulario">
              <button className="botao-primario" onClick={onFechar}>
                Entendi
              </button>
            </div>
          </>
        )}

        {estado === 'falha' && (
          <>
            <span className="status-icone status-icone-erro" aria-hidden="true">
              ×
            </span>
            <h2>Não foi possível concluir o pagamento</h2>
            <p className="detalhe-texto-livre">Você pode tentar novamente clicando em "Comprar agora".</p>
            <div className="acoes-formulario">
              <button className="botao-primario" onClick={onFechar}>
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default PagamentoStatusModal
