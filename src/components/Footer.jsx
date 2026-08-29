import { IconMail, IconPhone } from './icons'
import { rolarPara } from '../utils'

function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="rodape">
      <div className="rodape-grade">
        <div className="rodape-marca">
          <span className="marca">
            <span className="marca-icone">EH</span>
            <span className="marca-texto">EH Digital</span>
          </span>
          <p>Assinaturas premium com preço de atacado, direto pra você.</p>
        </div>

        <div>
          <h4>Contato</h4>
          <ul className="rodape-lista">
            <li>
              <IconMail /> contato@ehdigital.com.br
            </li>
            <li>
              <IconPhone /> (11) 90000-0000
            </li>
          </ul>
        </div>

        <div>
          <h4>Links úteis</h4>
          <ul className="rodape-lista">
            <li>
              <button onClick={() => rolarPara('produtos')}>Produtos</button>
            </li>
            <li>
              <button onClick={() => rolarPara('como-funciona')}>Como funciona</button>
            </li>
            <li>
              <button onClick={() => rolarPara('vantagens')}>Vantagens</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="rodape-copyright">© {ano} EH Digital. Todos os direitos reservados.</div>
    </footer>
  )
}

export default Footer
