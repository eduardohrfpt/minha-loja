// Funções de apoio ao Pixel da Meta. O código base do Pixel (que cria o window.fbq e já dispara
// o primeiro PageView) fica no index.html -- aqui só chamamos o fbq que ele deixou pronto.

// Se o Pixel não carregou (ex: bloqueador de anúncios), o fbq não existe. Esse "?." evita erro.
export function rastrear(evento, dados) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  if (dados) {
    window.fbq('track', evento, dados)
  } else {
    window.fbq('track', evento)
  }
}

export function rastrearPageView() {
  rastrear('PageView')
}

export function rastrearViewContent(produto) {
  rastrear('ViewContent', {
    content_name: produto.name,
    content_ids: [String(produto.id)],
    content_type: 'product',
    value: Number(produto.price),
    currency: 'BRL',
  })
}

export function rastrearInitiateCheckout(produto) {
  rastrear('InitiateCheckout', {
    value: Number(produto.price),
    currency: 'BRL',
  })
}

// Gera um ID único para um evento. Mais tarde, o Purchase sairá pelo servidor (API de Conversões)
// e também pelo navegador; mandando o MESMO event_id nos dois, a Meta entende que é a mesma
// compra e não conta duas vezes (deduplicação).
export function gerarEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}
