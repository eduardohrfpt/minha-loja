import { Link } from 'react-router-dom'
import { IconMail, IconLock, IconCard, IconRefresh, IconBolt } from './icons'

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

function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <div className="rodape-grade">
          <div className="rodape-marca">
            <span className="marca">
              <span className="marca-icone">HR</span>
              <span className="marca-texto">HRKeys</span>
            </span>
            <p>
              Produtos digitais com entrega automática. Você paga, o sistema compra e o acesso
              chega na hora — sem fila e sem intermediário.
            </p>
          </div>

          <div>
            <h4>Atendimento</h4>
            <ul className="rodape-lista">
              <li>
                <IconMail /> contato@hrkeys.com.br
              </li>
              <li>Segunda a sexta, 9h às 18h</li>
              <li>Respondemos em até 24h úteis</li>
            </ul>
          </div>

          <div>
            <h4>A Loja</h4>
            <ul className="rodape-lista">
              {LINKS_POLITICAS.map((item) => (
                <li key={item.slug}>
                  <Link to={`/politicas/${item.slug}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rodape-selos">
          {SELOS.map(({ Icone, texto }) => (
            <div className="rodape-selo" key={texto}>
              <Icone />
              <span>{texto}</span>
            </div>
          ))}
        </div>

        <div className="rodape-copyright">
          © {ano} HRKeys. As marcas citadas pertencem aos seus respectivos titulares; a HRKeys é
          revendedora independente e não tem vínculo com elas.
        </div>
      </div>
    </footer>
  )
}

export default Footer
