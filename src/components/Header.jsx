import { useState } from 'react'
import { rolarPara } from '../utils'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

const linksNav = [
  { id: 'produtos', label: 'Produtos' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'vantagens', label: 'Vantagens' },
]

function Header() {
  const { usuario, sair } = useAuth()
  const [modalAberto, setModalAberto] = useState(null)

  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <button className="marca" onClick={() => rolarPara('topo')}>
          <span className="marca-icone">EH</span>
          <span className="marca-texto">EH Digital</span>
        </button>

        <nav className="nav-desktop">
          {linksNav.map((link) => (
            <button key={link.id} onClick={() => rolarPara(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="cabecalho-acoes">
          {usuario ? (
            <>
              <span className="usuario-logado">{usuario.user_metadata?.nome || usuario.email}</span>
              <button className="botao-fantasma" onClick={sair}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button className="botao-fantasma" onClick={() => setModalAberto('login')}>
                Entrar
              </button>
              <button className="botao-primario" onClick={() => setModalAberto('cadastro')}>
                Criar conta
              </button>
            </>
          )}
        </div>
      </div>

      {modalAberto && <AuthModal modoInicial={modalAberto} onFechar={() => setModalAberto(null)} />}
    </header>
  )
}

export default Header
