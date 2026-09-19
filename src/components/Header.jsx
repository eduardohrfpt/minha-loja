import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { irParaSecao } from '../utils'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import MyOrdersModal from './MyOrdersModal'

const linksNavVisitante = [
  { id: 'produtos', label: 'Produtos' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'vantagens', label: 'Vantagens' },
]

function Header() {
  const { usuario, sair } = useAuth()
  const [modalAberto, setModalAberto] = useState(null)
  const [minhasComprasAberto, setMinhasComprasAberto] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Mesma prioridade nome > e-mail usada antes pro texto do usuário logado -- só a
  // exibição virou avatar (inicial em maiúscula) em vez do nome/e-mail por extenso.
  const nomeOuEmailUsuario = usuario?.user_metadata?.nome || usuario?.email || ''
  const inicialUsuario = nomeOuEmailUsuario.trim().charAt(0).toUpperCase() || '?'

  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <button
          className="marca"
          onClick={() => (usuario ? navigate('/catalogo') : irParaSecao(location, navigate, 'topo'))}
        >
          <span className="marca-icone">HR</span>
          <span className="marca-texto">HRKeys</span>
        </button>

        <nav className="nav-desktop">
          {usuario ? (
            <>
              <Link to="/catalogo">Catálogo de Produtos</Link>
              <button onClick={() => setMinhasComprasAberto(true)}>Minhas compras</button>
              <Link to="/suporte">Suporte/Ajuda</Link>
            </>
          ) : (
            <>
              {linksNavVisitante.map((link) => (
                <button key={link.id} onClick={() => irParaSecao(location, navigate, link.id)}>
                  {link.label}
                </button>
              ))}
              <button onClick={() => setModalAberto('cadastro')}>Criar conta</button>
            </>
          )}
        </nav>

        <div className="cabecalho-acoes">
          {usuario ? (
            <>
              <div className="usuario-logado-bloco">
                <span className="usuario-avatar">{inicialUsuario}</span>
                <span className="usuario-avatar-legenda">Cliente</span>
              </div>
              <span className="usuario-nome-completo">{nomeOuEmailUsuario}</span>
              <button className="botao-fantasma" onClick={async () => { await sair(); window.location.href = '/' }}>
                Sair
              </button>
            </>
          ) : (
            <button className="botao-fantasma" onClick={() => setModalAberto('login')}>
              Entrar
            </button>
          )}
        </div>
      </div>

      {modalAberto && <AuthModal modoInicial={modalAberto} onFechar={() => setModalAberto(null)} />}
      {minhasComprasAberto && <MyOrdersModal onFechar={() => setMinhasComprasAberto(false)} />}
    </header>
  )
}

export default Header
