import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function formatarTempo(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000))
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}

function Cronometro({ prazoLimite }) {
  const [restante, setRestante] = useState(() => prazoLimite - Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(prazoLimite - Date.now())
    }, 1000)
    return () => clearInterval(intervalo)
  }, [prazoLimite])

  return <div className="cronometro-entrega">{formatarTempo(restante)}</div>
}

// Sintetizado via Web Audio API (sem precisar de um arquivo de áudio). Silencioso se o
// navegador bloquear autoplay de som sem interação recente do usuário -- não é crítico.
function tocarSomSucesso() {
  try {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClasse) return
    const contexto = new AudioContextClasse()
    const agora = contexto.currentTime

    const tocarNota = (frequencia, inicio, duracao) => {
      const oscilador = contexto.createOscillator()
      const ganho = contexto.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = frequencia
      ganho.gain.setValueAtTime(0, agora + inicio)
      ganho.gain.linearRampToValueAtTime(0.2, agora + inicio + 0.02)
      ganho.gain.exponentialRampToValueAtTime(0.001, agora + inicio + duracao)
      oscilador.connect(ganho)
      ganho.connect(contexto.destination)
      oscilador.start(agora + inicio)
      oscilador.stop(agora + inicio + duracao)
    }

    tocarNota(880, 0, 0.15)
    tocarNota(1318.5, 0.12, 0.25)
  } catch {
    // API indisponível ou bloqueada -- segue sem som.
  }
}

function PagamentoStatusModal({ estado, produtoNome, codigo, guiaUso, prazoLimite, onFechar }) {
  const podeFechar = estado !== 'confirmando'

  // Toca o som só no momento em que a tela vira "sucesso" (inclusive na transição automática
  // vindo de "preparando"), não em toda renderização.
  useEffect(() => {
    if (estado === 'sucesso') {
      tocarSomSucesso()
    }
  }, [estado])

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

        {estado === 'preparando' && (
          <>
            <span className="status-icone status-icone-ok" aria-hidden="true">
              ✓
            </span>
            <h2>Pedido confirmado!</h2>
            {produtoNome && <p className="detalhe-texto-livre">{produtoNome}</p>}
            <p className="detalhe-texto-livre">Sua entrega será feita em até 10 minutos.</p>
            {prazoLimite && <Cronometro prazoLimite={prazoLimite} />}
            <p className="detalhe-texto-livre detalhe-texto-pequeno">
              Fique nesta tela — assim que sua chave estiver pronta, ela aparece aqui automaticamente. Você também
              pode conferir depois em "Minhas compras" ou no seu e-mail.
            </p>
            <div className="acoes-formulario">
              <button className="botao-primario" onClick={onFechar}>
                Fechar
              </button>
            </div>
          </>
        )}

        {estado === 'sucesso' && (
          <>
            <span className="status-icone status-icone-ok status-icone-animada" aria-hidden="true">
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
            <h2>Sua entrega está sendo preparada</h2>
            <p className="detalhe-texto-livre">
              Está levando um pouco mais que o esperado. Assim que a chave estiver pronta, enviaremos por e-mail e
              ela também vai aparecer em "Minhas compras".
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
