import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import V2AuthModal from './V2AuthModal'
import V2MyOrdersModal from './V2MyOrdersModal'
import { IconMenu2, IconX } from './v2icons'

const LINKS_VISITANTE = [
  { id: 'produtos', label: 'Catálogo' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'vantagens', label: 'Vantagens' },
]

function irParaSecaoV2(location, navigate, id) {
  if (location.pathname !== '/v2') {
    navigate('/v2')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function V2Header() {
  const { usuario, sair } = useAuth()
  const [modalAberto, setModalAberto] = useState(null)
  const [minhasComprasAberto, setMinhasComprasAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  function irOuFechar(acao) {
    setMenuAberto(false)
    acao()
  }

  return (
    <header className="v2-header">
      <div className="v2-container v2-header-linha">
        <button
          className="v2-marca"
          onClick={() => irOuFechar(() => (usuario ? navigate('/v2/catalogo') : irParaSecaoV2(location, navigate, 'topo')))}
        >
          <span className="v2-marca-selo">HR</span>
          <span className="v2-marca-nome">HRKeys</span>
        </button>

        <nav className="v2-nav-desktop">
          {usuario ? (
            <>
              <Link to="/v2/catalogo">Catálogo</Link>
              <Link to="/v2/suporte">Suporte/Ajuda</Link>
            </>
          ) : (
            <>
              {LINKS_VISITANTE.map((link) => (
                <button key={link.id} onClick={() => irParaSecaoV2(location, navigate, link.id)}>
                  {link.label}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="v2-header-acoes">
          {usuario ? (
            <>
              <span className="v2-usuario-logado">{usuario.user_metadata?.nome || usuario.email}</span>
              <button className="v2-botao v2-botao--fantasma" onClick={() => setMinhasComprasAberto(true)}>
                Minhas compras
              </button>
              <button
                className="v2-botao v2-botao--fantasma"
                onClick={async () => {
                  await sair()
                  window.location.href = '/v2'
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button className="v2-botao v2-botao--fantasma" onClick={() => setModalAberto('login')}>
                Entrar
              </button>
              <button className="v2-botao v2-botao--ouro" onClick={() => setModalAberto('cadastro')}>
                Criar conta grátis
              </button>
            </>
          )}
        </div>

        <button
          className="v2-menu-mobile-botao"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto((v) => !v)}
        >
          {menuAberto ? <IconX /> : <IconMenu2 />}
        </button>
      </div>

      {menuAberto && (
        <div className="v2-menu-mobile">
          {usuario ? (
            <>
              <Link to="/v2/catalogo" onClick={() => setMenuAberto(false)}>
                Catálogo
              </Link>
              <Link to="/v2/suporte" onClick={() => setMenuAberto(false)}>
                Suporte/Ajuda
              </Link>
              <button onClick={() => irOuFechar(() => setMinhasComprasAberto(true))}>Minhas compras</button>
              <button
                onClick={() =>
                  irOuFechar(async () => {
                    await sair()
                    window.location.href = '/v2'
                  })
                }
              >
                Sair
              </button>
            </>
          ) : (
            <>
              {LINKS_VISITANTE.map((link) => (
                <button key={link.id} onClick={() => irOuFechar(() => irParaSecaoV2(location, navigate, link.id))}>
                  {link.label}
                </button>
              ))}
              <button onClick={() => irOuFechar(() => setModalAberto('login'))}>Entrar</button>
              <button className="v2-menu-mobile-cta" onClick={() => irOuFechar(() => setModalAberto('cadastro'))}>
                Criar conta grátis
              </button>
            </>
          )}
        </div>
      )}

      {modalAberto && <V2AuthModal modoInicial={modalAberto} onFechar={() => setModalAberto(null)} />}
      {minhasComprasAberto && <V2MyOrdersModal onFechar={() => setMinhasComprasAberto(false)} />}
    </header>
  )
}

export default V2Header
