import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { abrirChatSuporte, esconderChatSuporte } from '../utils'

function CodigoDetalheModal({ produtoNome, codigo, guiaUso, onFechar }) {
  const location = useLocation()
  const { usuario } = useAuth()
  const primeiraRenderizacao = useRef(true)
  // MyOrdersModal passa uma arrow function nova a cada render -- guardar a mais recente num
  // ref evita que os efeitos abaixo disparem de novo só porque o pai renderizou de novo (o
  // que fecharia o modal sem o cliente ter saído da tela de verdade).
  const onFecharRef = useRef(onFechar)
  useEffect(() => {
    onFecharRef.current = onFechar
  })

  // Este modal pode ser aberto de dentro de outro modal (ex: "Minhas compras"). Mesmo
  // portalizando pro <body>, o clique ainda borbulha pela árvore do React, não do DOM --
  // sem parar aqui, fechar este modal também fecharia o modal por trás dele.
  function fechar(e) {
    e.stopPropagation()
    onFechar()
  }

  // Sempre que o cliente sai desta tela -- fecha o modal, troca de rota (ex: botão
  // voltar/avançar do navegador, já que o Header fica montado entre rotas e não fecha os
  // modais sozinho) ou desloga -- o chat deve voltar a ficar escondido. O cleanup abaixo
  // cobre todos os caminhos de saída, já que qualquer um deles desmonta este componente.
  useEffect(() => {
    return () => {
      esconderChatSuporte()
    }
  }, [])

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    onFecharRef.current()
  }, [location.pathname])

  useEffect(() => {
    if (!usuario) onFecharRef.current()
  }, [usuario])

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
          <button className="botao-secundario botao-suporte" onClick={abrirChatSuporte}>
            Falar com o suporte sobre esta compra
          </button>
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
