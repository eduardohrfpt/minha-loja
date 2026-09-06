import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import AdminToggle from '../components/AdminToggle'
import V2Header from './components/V2Header'
import V2Hero from './components/V2Hero'
import V2TrustBar from './components/V2TrustBar'
import V2HowItWorks from './components/V2HowItWorks'
import V2Catalog from './components/V2Catalog'
import V2WhyBuy from './components/V2WhyBuy'
import V2Faq from './components/V2Faq'
import V2CtaFinal from './components/V2CtaFinal'
import V2Footer from './components/V2Footer'
import V2SuportePage from './components/V2SuportePage'
import V2PoliticasPage from './components/V2PoliticasPage'
import './v2.css'

// Espelha a "PaginaInicial" da versão atual: visitante vê a landing completa, quem já tem
// conta cai direto no catálogo.
function V2PaginaInicial(propsCatalogo) {
  const { usuario } = useAuth()

  if (usuario) {
    return <Navigate to="/v2/catalogo" replace />
  }

  return (
    <>
      <V2Hero produtosDestaque={propsCatalogo.produtos.slice(0, 4)} />
      <V2TrustBar />
      <V2HowItWorks />
      <V2Catalog {...propsCatalogo} />
      <V2WhyBuy />
      <V2Faq />
      <V2CtaFinal />
    </>
  )
}

function V2Conteudo() {
  const [produtos, setProdutos] = useState([])
  const [estoque, setEstoque] = useState({})
  const [lojaAberta, setLojaAberta] = useState(true)
  const [mensagemLojaFechada, setMensagemLojaFechada] = useState('')
  const [modoAdminAtivo, setModoAdminAtivo] = useState(false)

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
    const { data, error } = await supabase
      .from('configuracoes_loja')
      .select('aberta, mensagem_fechado')
      .eq('id', 1)
      .maybeSingle()

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

  // Só cosmético: o título da aba reflete a versão nova enquanto ela está sendo visitada, e
  // volta ao título original ao sair.
  useEffect(() => {
    const tituloAnterior = document.title
    document.title = 'HRKeys — a nova versão da loja'
    return () => {
      document.title = tituloAnterior
    }
  }, [])

  const propsCatalogo = {
    produtos,
    estoque,
    recarregarProdutos: carregarProdutos,
    modoAdmin: modoAdminAtivo,
    lojaAberta,
    mensagemLojaFechada,
    recarregarConfiguracaoLoja: carregarConfiguracaoLoja,
  }

  return (
    <div className="v2-shell">
      <V2Header />
      <Routes>
        <Route index element={<V2PaginaInicial {...propsCatalogo} />} />
        <Route path="catalogo" element={<V2Catalog {...propsCatalogo} />} />
        <Route path="suporte" element={<V2SuportePage />} />
        <Route path="politicas/:aba" element={<V2PoliticasPage />} />
      </Routes>
      <V2Footer />
      <AdminToggle modoAdminAtivo={modoAdminAtivo} setModoAdminAtivo={setModoAdminAtivo} />
    </div>
  )
}

// Pagamentos são sempre processados e concluídos na tela da versão atual (o retorno do
// Mercado Pago aponta pra "/" — regra de negócio que não pode mudar nesta etapa). Por isso o
// V2App não duplica o polling de confirmação: ele só inicia a compra e a pessoa vê o código na
// tela de status já existente ao voltar do pagamento.
function V2App() {
  return (
    <AuthProvider>
      <V2Conteudo />
    </AuthProvider>
  )
}

export default V2App
