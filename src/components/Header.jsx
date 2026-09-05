import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { irParaSecao } from '../utils'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import MyOrdersModal from './MyOrdersModal'

const linksNav = [
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

  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <button className="marca" onClick={() => irParaSecao(location, navigate, 'topo')}>
          <span className="marca-icone">HR</span>
          <span className="marca-texto">HRKeys</span>
        </button>

        <nav className="nav-desktop">
          {linksNav.map((link) => (
            <button key={link.id} onClick={() => irParaSecao(location, navigate, link.id)}>
              {link.label}
            </button>
          ))}
          {!usuario && <button onClick={() => setModalAberto('cadastro')}>Criar conta</button>}
        </nav>

        <div className="cabecalho-acoes">
          {usuario ? (
            <>
              <span className="usuario-logado">{usuario.user_metadata?.nome || usuario.email}</span>
              <button className="botao-fantasma" onClick={() => setMinhasComprasAberto(true)}>
                Minhas compras
              </button>
              <button className="botao-fantasma" onClick={sair}>
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
