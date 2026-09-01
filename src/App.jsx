import { useEffect, useRef, useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'
import Header from './components/Header'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import HowItWorks from './components/HowItWorks'
import Catalog from './components/Catalog'
import WhyBuy from './components/WhyBuy'
import Faq from './components/Faq'
import CtaFinal from './components/CtaFinal'
import Footer from './components/Footer'
import AdminToggle from './components/AdminToggle'
import PagamentoStatusModal from './components/PagamentoStatusModal'
import './App.css'

// Depois que o Mercado Pago aprova um pagamento, o webhook (server-side) demora um pouco pra
// processar e liberar o código. Em vez de mandar o cliente procurar manualmente em "Minhas
// compras", ficamos checando aqui até o pedido aparecer.
const INTERVALO_POLLING_MS = 3000
const TENTATIVAS_MAX_POLLING = 100 // ~5 minutos, tempo suficiente pra a maioria dos Pix compensar

function App() {
  const [produtos, setProdutos] = useState([])
  const [estoque, setEstoque] = useState({})
  const [modoAdminAtivo, setModoAdminAtivo] = useState(false)
  const [statusPagamento, setStatusPagamento] = useState(null)
  const cancelarPollingRef = useRef(false)

  async function carregarProdutos() {
    const [produtosResp, estoqueResp] = await Promise.all([
      supabase.from('products').select('*').order('created_at'),
      supabase.from('estoque_disponivel').select('*'),
    ])

    if (produtosResp.error) {
      console.error(produtosResp.error)
      return
    }
    setProdutos(produtosResp.data)

    if (estoqueResp.error) {
      console.error(estoqueResp.error)
      return
    }
    const mapa = {}
    estoqueResp.data.forEach((linha) => {
      mapa[linha.product_id] = linha.disponivel
    })
    setEstoque(mapa)
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // O Mercado Pago acrescenta esses parâmetros sozinho ao voltar pro back_url, tanto no
    // auto_return (cartão aprovado na hora) quanto quando o comprador clica em "voltar ao
    // site" na tela do Pix ainda pendente.
    const paymentId = params.get('payment_id') || params.get('collection_id')
    const status = params.get('status') || params.get('collection_status')

    if (!paymentId) return

    window.history.replaceState({}, '', window.location.pathname)

    if (status === 'rejected' || status === 'cancelled') {
      setStatusPagamento({ estado: 'falha' })
      return
    }

    setStatusPagamento({ estado: 'confirmando' })
    cancelarPollingRef.current = false

    async function aguardarConfirmacao() {
      for (let tentativa = 0; tentativa < TENTATIVAS_MAX_POLLING; tentativa++) {
        if (cancelarPollingRef.current) return

        const { data } = await supabase
          .from('orders')
          .select('products(name), codigos_produto(codigo)')
          .eq('payment_id', paymentId)
          .maybeSingle()

        const codigo = data?.codigos_produto?.[0]?.codigo
        if (codigo) {
          setStatusPagamento({ estado: 'sucesso', produtoNome: data.products?.name, codigo })
          carregarProdutos()
          return
        }

        await new Promise((resolve) => setTimeout(resolve, INTERVALO_POLLING_MS))
      }

      if (!cancelarPollingRef.current) {
        setStatusPagamento((atual) => (atual?.estado === 'confirmando' ? { estado: 'expirado' } : atual))
      }
    }

    aguardarConfirmacao()

    return () => {
      cancelarPollingRef.current = true
    }
  }, [])

  function fecharStatusPagamento() {
    cancelarPollingRef.current = true
    setStatusPagamento(null)
  }

  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <Hero produtosDestaque={produtos.slice(0, 4)} />
        <TrustBar />
        <HowItWorks />
        <Catalog
          produtos={produtos}
          estoque={estoque}
          recarregarProdutos={carregarProdutos}
          modoAdmin={modoAdminAtivo}
        />
        <WhyBuy />
        <Faq />
        <CtaFinal />
        <Footer />
        <AdminToggle modoAdminAtivo={modoAdminAtivo} setModoAdminAtivo={setModoAdminAtivo} />
        {statusPagamento && (
          <PagamentoStatusModal
            estado={statusPagamento.estado}
            produtoNome={statusPagamento.produtoNome}
            codigo={statusPagamento.codigo}
            onFechar={fecharStatusPagamento}
          />
        )}
      </div>
    </AuthProvider>
  )
}

export default App
