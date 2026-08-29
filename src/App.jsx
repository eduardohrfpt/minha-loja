import { useEffect, useState } from 'react'
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

const STORAGE_KEY = 'catalogo-produtos'

const produtosIniciais = [
  {
    id: 1,
    nome: 'ChatGPT Plus',
    marca: 'OpenAI',
    preco: 97.9,
    desconto: 10,
    imagem: '🤖',
    selo: 'Mais vendido',
    disponivel: true,
    descricao: 'Acesso ao GPT-5, geração de imagens e prioridade nos horários de pico.',
  },
  {
    id: 2,
    nome: 'Notion Plus',
    marca: 'Notion',
    preco: 40,
    desconto: 0,
    imagem: '📝',
    selo: '',
    disponivel: true,
    descricao: 'Espaço colaborativo ilimitado com histórico de versões completo.',
  },
  {
    id: 3,
    nome: 'Spotify Premium',
    marca: 'Spotify',
    preco: 21.9,
    desconto: 15,
    imagem: '🎵',
    selo: 'Oferta',
    disponivel: true,
    descricao: 'Música sem anúncios, com download offline e qualidade máxima.',
  },
  {
    id: 4,
    nome: 'Netflix Padrão',
    marca: 'Netflix',
    preco: 44.9,
    desconto: 0,
    imagem: '🎬',
    selo: '',
    disponivel: true,
    descricao: 'Catálogo completo em full HD, com 2 telas simultâneas.',
  },
  {
    id: 5,
    nome: 'Canva Pro',
    marca: 'Canva',
    preco: 34.9,
    desconto: 20,
    imagem: '🎨',
    selo: 'Novo',
    disponivel: true,
    descricao: 'Milhares de templates premium e remoção de fundo com um clique.',
  },
  {
    id: 6,
    nome: 'Disney+',
    marca: 'Disney',
    preco: 33.9,
    desconto: 0,
    imagem: '🏰',
    selo: '',
    disponivel: false,
    descricao: 'Catálogo Disney, Pixar, Marvel, Star Wars e National Geographic.',
  },
]

function carregarProdutos() {
  const salvos = localStorage.getItem(STORAGE_KEY)
  return salvos ? JSON.parse(salvos) : produtosIniciais
}

function App() {
  const [produtos, setProdutos] = useState(carregarProdutos)
  const [modoAdmin, setModoAdmin] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos))
  }, [produtos])

  return (
    <div className="app">
      <Header />
      <Hero produtosDestaque={produtos.slice(0, 4)} />
      <TrustBar />
      <HowItWorks />
      <Catalog produtos={produtos} setProdutos={setProdutos} modoAdmin={modoAdmin} />
      <WhyBuy />
      <Faq />
      <CtaFinal />
      <Footer />
      <AdminToggle modoAdmin={modoAdmin} setModoAdmin={setModoAdmin} />
    </div>
  )
}

export default App
