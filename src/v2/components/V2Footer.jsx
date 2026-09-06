import { Link } from 'react-router-dom'
import { IconMail, IconLock, IconCard, IconRefresh, IconBolt } from './v2icons'

const LINKS_POLITICAS = [
  { slug: 'termos-de-uso', label: 'Termos de uso' },
  { slug: 'codigos-e-links-de-ativacao', label: 'Códigos e links de ativação' },
  { slug: 'politica-de-privacidade', label: 'Política de privacidade' },
  { slug: 'reembolso-e-garantia', label: 'Reembolso e garantia' },
]

const SELOS = [
  { Icone: IconLock, texto: 'Conexão criptografada' },
  { Icone: IconCard, texto: 'Pagamento via Mercado Pago' },
  { Icone: IconRefresh, texto: 'Reembolso se a entrega falhar' },
  { Icone: IconBolt, texto: 'Entrega automática 24/7' },
]

function V2Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="v2-rodape">
      <div className="v2-container">
        <div className="v2-rodape-grade">
          <div className="v2-rodape-marca">
            <span className="v2-marca">
              <span className="v2-marca-selo">HR</span>
              <span className="v2-marca-nome">HRKeys</span>
            </span>
            <p>Assinaturas e licenças digitais 100% originais. Simples assim: pagou, recebeu.</p>
          </div>

          <div>
            <h4>Atendimento</h4>
            <ul className="v2-rodape-lista">
              <li>
                <IconMail /> contato@hrkeys.com.br
              </li>
              <li>Segunda a sexta, 9h às 18h</li>
              <li>Respondemos em até 24h úteis</li>
            </ul>
          </div>

          <div>
            <h4>A Loja</h4>
            <ul className="v2-rodape-lista">
              {LINKS_POLITICAS.map((item) => (
                <li key={item.slug}>
                  <Link to={`/v2/politicas/${item.slug}`}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/v2/suporte">Suporte/Ajuda</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="v2-rodape-selos">
          {SELOS.map(({ Icone, texto }) => (
            <div className="v2-rodape-selo" key={texto}>
              <Icone />
              <span>{texto}</span>
            </div>
          ))}
        </div>

        <div className="v2-rodape-copyright">
          © {ano} HRKeys. As marcas citadas pertencem aos seus respectivos titulares; a HRKeys é
          revendedora independente e não tem vínculo com elas.
        </div>
      </div>
    </footer>
  )
}

export default V2Footer
