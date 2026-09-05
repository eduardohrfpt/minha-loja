import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import PoliticasPage from './components/PoliticasPage'
import SuportePage from './components/SuportePage'
import './App.css'

// Landing (marketing) só aparece pra quem ainda não tem conta. Quem já está logado cai direto
// no catálogo ao acessar "/" -- não faz sentido mostrar hero/vantagens/FAQ pra quem já é cliente.
function PaginaInicial(propsCatalogo) {
  const { usuario } = useAuth()

  if (usuario) {
    return <Navigate to="/catalogo" replace />
  }

  return (
    <>
      <Hero produtosDestaque={propsCatalogo.produtos.slice(0, 4)} />
      <TrustBar />
      <HowItWorks />
      <Catalog {...propsCatalogo} />
      <WhyBuy />
      <Faq />
      <CtaFinal />
    </>
  )
}

// Depois que o Mercado Pago aprova um pagamento, o webhook (server-side) demora um pouco pra
// processar e liberar o código. Em vez de mandar o cliente procurar manualmente em "Minhas
// compras", ficamos checando aqui até o pedido aparecer. O teto cobre tanto a confirmação do
// Pix quanto os 10 minutos prometidos pra entrega manual via Telegram.
const INTERVALO_POLLING_MS = 3000
const TENTATIVAS_MAX_POLLING = 260 // ~13 minutos
const PRAZO_ENTREGA_MANUAL_MS = 10 * 60 * 1000

function App() {
  const [produtos, setProdutos] = useState([])
  const [estoque, setEstoque] = useState({})
  const [lojaAberta, setLojaAberta] = useState(true)
  const [mensagemLojaFechada, setMensagemLojaFechada] = useState('')
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

  async function carregarConfiguracaoLoja() {
    const { data, error } = await supabase.from('configuracoes_loja').select('aberta, mensagem_fechado').eq('id', 1).maybeSingle()

    if (error) {
      console.error(error)
      return
    }
    if (data) {
      setLojaAberta(data.aberta)
      setMensagemLojaFechada(data.mensagem_fechado)
    }
  }

  useEffect(() => {
    carregarProdutos()
    carregarConfiguracaoLoja()
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
          .select('status, created_at, products(name, guia_uso_codigo), codigos_produto(codigo)')
          .eq('payment_id', paymentId)
          .maybeSingle()

        const codigo = data?.codigos_produto?.[0]?.codigo
        if (codigo) {
          setStatusPagamento({
            estado: 'sucesso',
            produtoNome: data.products?.name,
            guiaUso: data.products?.guia_uso_codigo || [],
            codigo,
          })
          carregarProdutos()
          return
        }

        // Entrega manual (via Telegram): o pedido já existe, mas ainda sem código -- mostra o
        // aviso com o cronômetro de 10 minutos e continua checando em segundo plano.
        if (data?.status === 'preparando_entrega') {
          const prazoLimite = new Date(data.created_at).getTime() + PRAZO_ENTREGA_MANUAL_MS
          setStatusPagamento((atual) =>
            atual?.estado === 'preparando' ? atual : { estado: 'preparando', produtoNome: data.products?.name, prazoLimite },
          )
        }

        await new Promise((resolve) => setTimeout(resolve, INTERVALO_POLLING_MS))
      }

      if (!cancelarPollingRef.current) {
        setStatusPagamento((atual) =>
          atual?.estado === 'confirmando' || atual?.estado === 'preparando' ? { estado: 'expirado' } : atual,
        )
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
        <Routes>
          <Route
            path="/"
            element={
              <PaginaInicial
                produtos={produtos}
                estoque={estoque}
                recarregarProdutos={carregarProdutos}
                modoAdmin={modoAdminAtivo}
                lojaAberta={lojaAberta}
                mensagemLojaFechada={mensagemLojaFechada}
                recarregarConfiguracaoLoja={carregarConfiguracaoLoja}
              />
            }
          />
          <Route
            path="/catalogo"
            element={
              <Catalog
                produtos={produtos}
                estoque={estoque}
                recarregarProdutos={carregarProdutos}
                modoAdmin={modoAdminAtivo}
                lojaAberta={lojaAberta}
                mensagemLojaFechada={mensagemLojaFechada}
                recarregarConfiguracaoLoja={carregarConfiguracaoLoja}
              />
            }
          />
          <Route path="/suporte" element={<SuportePage />} />
          <Route path="/politicas/:aba" element={<PoliticasPage />} />
        </Routes>
        <Footer />
        <AdminToggle modoAdminAtivo={modoAdminAtivo} setModoAdminAtivo={setModoAdminAtivo} />
        {statusPagamento && (
          <PagamentoStatusModal
            estado={statusPagamento.estado}
            produtoNome={statusPagamento.produtoNome}
            codigo={statusPagamento.codigo}
            guiaUso={statusPagamento.guiaUso}
            prazoLimite={statusPagamento.prazoLimite}
            onFechar={fecharStatusPagamento}
          />
        )}
      </div>
    </AuthProvider>
  )
}

export default App
