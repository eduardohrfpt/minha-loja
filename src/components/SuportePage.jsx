import { Link } from 'react-router-dom'
import { IconMail } from './icons'

function SuportePage() {
  return (
    <section className="pagina-politicas">
      <div className="politicas-cabecalho">
        <Link to="/" className="politicas-voltar">
          ← Voltar pra loja
        </Link>
        <h1>Suporte e ajuda</h1>
      </div>

      <div className="politicas-conteudo">
        <div className="politicas-secao">
          <h3>Fale com a gente</h3>
          <p>
            Dúvidas sobre um pedido, problema com um código ou qualquer outra coisa? Manda um e-mail que a gente
            responde em até 24h úteis.
          </p>
          <p>
            <IconMail className="suporte-icone-inline" /> <a href="mailto:contato@hrkeys.com.br">contato@hrkeys.com.br</a>
          </p>
        </div>

        <div className="politicas-secao">
          <h3>Horário de atendimento</h3>
          <p>Segunda a sexta, 9h às 18h.</p>
        </div>

        <div className="politicas-secao">
          <h3>Políticas da loja</h3>
          <p>
            Termos de uso, política de privacidade, reembolso e garantia — tudo isso está detalhado nas{' '}
            <Link to="/politicas/termos-de-uso">políticas da HRKeys</Link>.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SuportePage
