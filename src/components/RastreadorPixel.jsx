import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { rastrearPageView } from '../lib/metaPixel'

// Dispara PageView a cada troca de rota. Não renderiza nada na tela.
// O index.html já dispara o PageView da primeira carga, então a primeira execução é ignorada.
// O useRef guarda isso mesmo com o StrictMode (que roda effects duas vezes em desenvolvimento).
function RastreadorPixel() {
  const { pathname, search } = useLocation()
  const ultimaRota = useRef(pathname + search)

  useEffect(() => {
    const rotaAtual = pathname + search
    if (rotaAtual === ultimaRota.current) return
    ultimaRota.current = rotaAtual
    rastrearPageView()
  }, [pathname, search])

  return null
}

export default RastreadorPixel
