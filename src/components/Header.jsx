import { rolarPara } from '../utils'

const linksNav = [
  { id: 'produtos', label: 'Produtos' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'vantagens', label: 'Vantagens' },
]

function avisoEmBreve() {
  alert('Sistema de contas em desenvolvimento 🚧')
}

function Header() {
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
          <button className="botao-fantasma" onClick={avisoEmBreve}>
            Entrar
          </button>
          <button className="botao-primario" onClick={avisoEmBreve}>
            Criar conta
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
