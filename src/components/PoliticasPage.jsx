import { Link, Navigate, useParams } from 'react-router-dom'

const ABAS = [
  {
    slug: 'termos-de-uso',
    titulo: 'Termos de uso',
    secoes: [
      {
        titulo: 'Quem somos',
        paragrafos: [
          'A loja HRKeys é operada por Eduardo Henrique. Ao comprar aqui, você está contratando diretamente com essa pessoa física, não com uma empresa terceira.',
        ],
      },
      {
        titulo: 'O que vendemos',
        paragrafos: [
          'Vendemos produtos digitais: links de ativação e códigos oficiais de assinatura de plataformas de terceiros. Não há envio físico, portanto não existe produto para devolver fisicamente — a garantia funciona por reembolso (veja a aba "Reembolso e garantia").',
          'Somos revendedores independentes: negociamos condições especiais para comprar essas assinaturas por um preço menor e repassamos o desconto pra você. Não somos afiliados, representantes oficiais nem parceiros das plataformas cujos produtos revendemos.',
          'Não vendemos software crackeado, pirateado ou qualquer forma de acesso não autorizado, nem contas compartilhadas ou de uso coletivo. Todo código ou link entregue é gerado através dos canais oficiais da própria plataforma.',
        ],
      },
      {
        titulo: 'Como funciona a compra',
        paragrafos: [
          'Você escolhe o produto no catálogo e o pagamento é processado pelo Mercado Pago (Pix, cartão ou boleto) — nós não recebemos nem armazenamos os dados do seu cartão em nenhum momento.',
          'Assim que o pagamento é aprovado, nosso sistema compra automaticamente o acesso junto ao fornecedor e libera o código ou link na hora, sem intervenção manual. O conteúdo entregue fica disponível a qualquer momento em "Minhas compras", na sua conta.',
        ],
      },
      {
        titulo: 'Sua responsabilidade',
        paragrafos: [
          'Ao usar o site, você se compromete a: fornecer dados verdadeiros no cadastro; guardar o link/código e as credenciais de ativação em local seguro; ativar o produto dentro do prazo informado na ficha do produto; respeitar os termos de uso da plataforma de destino; e não revender, redistribuir ou compartilhar os códigos adquiridos.',
        ],
      },
      {
        titulo: 'O que não fazemos',
        paragrafos: [
          'Não vendemos software crackeado ou pirateado. Não pedimos a senha da sua conta em nenhuma plataforma de terceiros. Não solicitamos dados do seu cartão fora do ambiente do Mercado Pago. E não garantimos recursos, preços ou condições que a própria plataforma venha a alterar depois da ativação — isso está fora do nosso controle.',
        ],
      },
      {
        titulo: 'Suspensão de conta',
        paragrafos: [
          'Podemos suspender ou encerrar sua conta, sem aviso prévio, em casos de fraude, chargeback indevido (contestação de pagamento sem justa causa após a entrega comprovada) ou revenda dos códigos adquiridos.',
        ],
      },
      {
        titulo: 'Foro e contato',
        paragrafos: [
          'Estes termos são regidos pela legislação brasileira. Dúvidas, solicitações ou reclamações podem ser enviadas para contato@hrkeys.com.br.',
        ],
      },
    ],
  },
  {
    slug: 'codigos-e-links-de-ativacao',
    titulo: 'Códigos e links de ativação',
    secoes: [
      {
        titulo: 'Natureza do produto',
        paragrafos: [
          'O que você recebe é um código ou link oficial para ativar uma assinatura em uma plataforma de terceiros — nunca uma conta pronta com login e senha definidos por nós. A ativação é feita pelo próprio cliente, na própria conta do cliente.',
        ],
      },
      {
        titulo: 'Validade e funcionamento',
        paragrafos: [
          'O código ou link é válido no momento em que é entregue. Depois de ativado, a assinatura passa a seguir integralmente as regras, prazos e condições definidos pela plataforma original — duração, renovação, cancelamento e demais políticas.',
        ],
      },
      {
        titulo: 'Responsabilidade do cliente',
        paragrafos: [
          'É responsabilidade do cliente: usar o código na conta correta (a que pretende manter a assinatura); conferir os requisitos de ativação informados na ficha do produto antes de comprar; e guardar o código com segurança até o momento do uso, já que ele não pode ser reemitido depois de utilizado.',
        ],
      },
      {
        titulo: 'Política de reembolso',
        paragrafos: [
          'Reembolso integral quando o código não funciona e não foi usado, ou quando houve um problema técnico na entrega (por exemplo, o código não chegou por falha do nosso sistema). Basta entrar em contato pelo contato@hrkeys.com.br.',
        ],
      },
      {
        titulo: 'Limitação de responsabilidade',
        paragrafos: [
          'Não garantimos que o acesso permanecerá disponível por tempo indeterminado — isso depende exclusivamente das políticas da plataforma original, que pode alterar preços, recursos ou descontinuar o serviço a qualquer momento, fora do nosso controle.',
        ],
      },
      {
        titulo: 'Disposições gerais',
        paragrafos: [
          'Estes termos podem ser atualizados periodicamente para refletir mudanças nas plataformas parceiras ou na legislação aplicável. A versão vigente é sempre a publicada nesta página.',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidade',
    titulo: 'Política de privacidade',
    secoes: [
      {
        titulo: 'O que coletamos',
        paragrafos: [
          'Nome, e-mail, senha (armazenada como hash criptográfico, nunca em texto puro) e dados da sua compra: produto, valor, data e status do pagamento.',
        ],
      },
      {
        titulo: 'O que não coletamos',
        paragrafos: [
          'Não coletamos nem armazenamos dados do seu cartão de crédito — o pagamento é processado inteiramente pelo Mercado Pago. Também não usamos rastreadores de publicidade de terceiros no site.',
        ],
      },
      {
        titulo: 'Base legal (LGPD)',
        paragrafos: [
          'Tratamos seus dados com base em: execução de contrato, para processar sua compra e entregar o produto; cumprimento de obrigação legal, como a emissão de documentos fiscais quando aplicável; e legítimo interesse, para prevenção a fraude e suporte ao cliente.',
        ],
      },
      {
        titulo: 'Com quem compartilhamos',
        paragrafos: [
          'Compartilhamos dados estritamente necessários com o Mercado Pago, para processar o pagamento, e com o fornecedor do produto digital, ao qual informamos apenas o item comprado e a quantidade — nunca seus dados pessoais completos.',
        ],
      },
      {
        titulo: 'Quanto tempo guardamos',
        paragrafos: [
          'Seus dados de conta ficam armazenados enquanto sua conta existir. Registros de acesso (logs) são mantidos por até 6 meses, conforme exigido pela legislação brasileira.',
        ],
      },
      {
        titulo: 'Seus direitos',
        paragrafos: [
          'Você pode, a qualquer momento, solicitar acesso aos seus dados, correção de informações incorretas, portabilidade, exclusão da conta e revogação do consentimento. Basta escrever pra contato@hrkeys.com.br.',
        ],
      },
      {
        titulo: 'Segurança',
        paragrafos: [
          'Usamos conexão criptografada (HTTPS) em todo o site, senhas armazenadas com hash criptográfico e oferecemos verificação em duas etapas para proteger sua conta.',
        ],
      },
    ],
  },
  {
    slug: 'reembolso-e-garantia',
    titulo: 'Reembolso e garantia',
    secoes: [
      {
        titulo: 'A promessa',
        paragrafos: [
          'Se você pagou e não recebeu o produto, devolvemos 100% do valor. Sem letra miúda.',
          'Você também tem direito de arrependimento em até 7 dias corridos após a compra (art. 49 do Código de Defesa do Consumidor), desde que o conteúdo do código ou link ainda não tenha sido revelado ou utilizado — depois que o código é mostrado na tela ou enviado por e-mail, ele já não pode ser reembolsado por arrependimento, já que se trata de um conteúdo digital que não pode ser "devolvido".',
        ],
      },
      {
        titulo: 'Como resolver',
        paragrafos: [
          'Entre em contato pelo contato@hrkeys.com.br contando o que aconteceu. Respondemos em até 24h úteis.',
        ],
      },
    ],
  },
]

function PoliticasPage() {
  const { aba } = useParams()
  const abaAtiva = ABAS.find((item) => item.slug === aba)

  if (!abaAtiva) {
    return <Navigate to={`/politicas/${ABAS[0].slug}`} replace />
  }

  return (
    <section className="pagina-politicas">
      <div className="politicas-cabecalho">
        <Link to="/" className="politicas-voltar">
          ← Voltar pra loja
        </Link>
        <h1>Políticas da HRKeys</h1>
      </div>

      <nav className="politicas-abas">
        {ABAS.map((item) => (
          <Link
            key={item.slug}
            to={`/politicas/${item.slug}`}
            className={`aba-botao ${abaAtiva.slug === item.slug ? 'ativa' : ''}`}
          >
            {item.titulo}
          </Link>
        ))}
      </nav>

      <div className="politicas-conteudo">
        <h2>{abaAtiva.titulo}</h2>
        {abaAtiva.secoes.map((secao) => (
          <div className="politicas-secao" key={secao.titulo}>
            <h3>{secao.titulo}</h3>
            {secao.paragrafos.map((paragrafo, indice) => (
              <p key={indice}>{paragrafo}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default PoliticasPage
