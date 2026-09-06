import { Link } from 'react-router-dom'
import { IconMail } from './v2icons'

function V2SuportePage() {
  return (
    <section className="v2-pagina-institucional">
      <div className="v2-container">
        <div className="v2-institucional-cabecalho">
          <Link to="/v2" className="v2-institucional-voltar">
            ← Voltar pra loja
          </Link>
          <h1>Suporte e ajuda</h1>
        </div>

        <div className="v2-institucional-conteudo">
          <div className="v2-institucional-secao">
            <h3>Fale com a gente</h3>
            <p>
              Dúvida sobre um pedido, problema com um código ou qualquer outra coisa? Manda um e-mail que
              respondemos em até 24h úteis — gente de verdade, sem robô de atendimento.
            </p>
            <p className="v2-suporte-contato">
              <IconMail /> <a href="mailto:contato@hrkeys.com.br">contato@hrkeys.com.br</a>
            </p>
          </div>

          <div className="v2-institucional-secao">
            <h3>Horário de atendimento</h3>
            <p>Segunda a sexta, 9h às 18h.</p>
          </div>

          <div className="v2-institucional-secao">
            <h3>Políticas da loja</h3>
            <p>
              Termos de uso, política de privacidade, reembolso e garantia — tudo isso está detalhado nas{' '}
              <Link to="/v2/politicas/termos-de-uso">políticas da HRKeys</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default V2SuportePage
