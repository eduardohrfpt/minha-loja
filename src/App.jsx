import { useEffect, useState } from 'react'
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
import './App.css'

function App() {
  const [produtos, setProdutos] = useState([])
  const [modoAdminAtivo, setModoAdminAtivo] = useState(false)

  async function carregarProdutos() {
    const { data, error } = await supabase.from('products').select('*').order('created_at')
    if (error) {
      console.error(error)
      return
    }
    setProdutos(data)
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <Hero produtosDestaque={produtos.slice(0, 4)} />
        <TrustBar />
        <HowItWorks />
        <Catalog produtos={produtos} recarregarProdutos={carregarProdutos} modoAdmin={modoAdminAtivo} />
        <WhyBuy />
        <Faq />
        <CtaFinal />
        <Footer />
        <AdminToggle modoAdminAtivo={modoAdminAtivo} setModoAdminAtivo={setModoAdminAtivo} />
      </div>
    </AuthProvider>
  )
}

export default App
