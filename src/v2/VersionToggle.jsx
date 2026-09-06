import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './v2.css'

const CHAVE_LOCALSTORAGE = 'hrkeys:versao-preferida'

// Mapeia um caminho de uma versão pra sua página equivalente na outra, pra quem clicar no
// alternador continuar na mesma página em vez de sempre cair na home.
function mapearCaminho(caminhoAtual, paraV2) {
  const semPrefixo = caminhoAtual.replace(/^\/v2/, '') || '/'
  if (!paraV2) return semPrefixo
  return semPrefixo === '/' ? '/v2' : `/v2${semPrefixo}`
}

function VersionToggle() {
  const location = useLocation()
  const navigate = useNavigate()
  const emV2 = location.pathname.startsWith('/v2')

  // Mantém o localStorage refletindo a versão que a pessoa está vendo agora, mesmo que ela
  // tenha chegado por um link direto em vez de clicar no botão.
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_LOCALSTORAGE, emV2 ? 'v2' : 'v1')
    } catch {
      // Armazenamento indisponível (modo privado, por exemplo) -- não é crítico.
    }
  }, [emV2])

  function alternar() {
    const destino = mapearCaminho(location.pathname, !emV2)
    try {
      localStorage.setItem(CHAVE_LOCALSTORAGE, emV2 ? 'v1' : 'v2')
    } catch {
      // Segue sem salvar a preferência.
    }
    navigate(destino)
  }

  return (
    <button
      type="button"
      className={`v2-toggle-versao ${emV2 ? 'v2-toggle-versao--novo' : ''}`}
      onClick={alternar}
    >
      {emV2 ? '← Voltar ao site atual' : '✨ Ver novo site'}
    </button>
  )
}

export default VersionToggle
