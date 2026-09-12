import { useEffect } from 'react'

// GSAP (+ o plugin ScrollTrigger) só é baixado na primeira vez que algum componente realmente
// usa este hook -- fica de fora do bundle principal do site -- e só uma vez, graças ao cache
// dessa promise (chamadas seguintes reaproveitam o mesmo import).
let carregamentoGsap
function carregarGsap() {
  if (!carregamentoGsap) {
    carregamentoGsap = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)
        return gsap
      },
    )
  }
  return carregamentoGsap
}

// Anima com fade + leve deslocamento pra cima cada elemento marcado com o atributo
// data-reveal dentro do container, disparado conforme cada um entra na tela (uma vez só, não
// fica reanimando ao rolar pra cima e pra baixo). Passe `dependencias` quando o conteúdo do
// container só existe depois de um carregamento assíncrono (ex: lista de produtos vinda do
// Supabase) -- o efeito roda de novo e pega os elementos que passaram a existir no DOM.
export function useScrollReveal(containerRef, dependencias = []) {
  useEffect(() => {
    // Respeita quem pediu menos animação no sistema operacional -- conteúdo aparece direto.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef.current
    if (!container) return

    let cancelado = false
    let contexto

    carregarGsap().then((gsap) => {
      if (cancelado || !containerRef.current) return
      contexto = gsap.context(() => {
        const elementos = container.querySelectorAll('[data-reveal]')
        elementos.forEach((elemento, indice) => {
          gsap.fromTo(
            elemento,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              delay: (indice % 6) * 0.06,
              scrollTrigger: {
                trigger: elemento,
                start: 'top 88%',
                once: true,
              },
            },
          )
        })
      }, container)
    })

    return () => {
      cancelado = true
      contexto?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)
}
