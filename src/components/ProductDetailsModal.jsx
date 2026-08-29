import { createPortal } from 'react-dom'
import { formatarPreco } from '../utils'
import { IconCheck, IconShield, IconLock, IconHeadset } from './icons'

const ONDE_ATIVA = 'Na sua própria conta'
const TIPO_LINK = 'Link oficial, resgatado no site da própria plataforma'
const ENTREGA_GRID = 'Entrega automática, assim que o pagamento é aprovado'
const PRAZO_ENTREGA_FICHA = 'Imediato, pode levar até 24h em dias de alta demanda'
const GARANTIA_FICHA = 'Reembolso integral se a entrega falhar'

const SELOS_CONFIANCA = [
  { Icone: IconShield, texto: 'Não recebeu? Devolvemos 100%' },
  { Icone: IconLock, texto: 'Pagamento pelo Mercado Pago' },
  { Icone: IconHeadset, texto: 'Suporte humano' },
]

const INFORMACOES_IMPORTANTES =
  'Ao ativar o produto, você concorda com os termos de uso da plataforma original. Não é possível trocar ou estornar a compra após a ativação do código. Mantenha acesso ao e-mail cadastrado, pois pode ser necessário para confirmar a ativação.'

const PASSOS_PADRAO = [
  'Conclua a compra e receba o código na tela.',
  'Siga as instruções enviadas.',
  'Ative na sua conta.',
]

function ProductDetailsModal({ produto, onFechar, onComprar }) {
  if (!produto) return null

  const economia = produto.original_price - produto.price
  const passos = produto.passos_ativacao?.length > 0 ? produto.passos_ativacao : PASSOS_PADRAO
  const entregaLabel = produto.delivery_type === 'imediata' ? 'Entrega imediata' : 'Entrega manual'

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-detalhes-completo" onClick={(e) => e.stopPropagation()}>
        <div className="detalhe-header">
          <span className="icone-marca icone-marca-grande">{produto.image}</span>
          <div>
            <h3>{produto.name}</h3>
            <span className="card-marca">{produto.brand}</span>
            {produto.tagline && <p className="detalhe-tagline">{produto.tagline}</p>}
          </div>
        </div>

        {produto.beneficios?.length > 0 && (
          <ul className="detalhe-beneficios">
            {produto.beneficios.map((item) => (
              <li key={item}>
                <IconCheck className="icone-check" />
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="caixa-preco">
          <div className="caixa-preco-linha">
            {produto.discount > 0 && (
              <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
            )}
            <span className="preco-final">{formatarPreco(produto.price)}</span>
          </div>
          {produto.discount > 0 && (
            <span className="caixa-preco-economia">
              -{produto.discount}% · economize {formatarPreco(economia)}
            </span>
          )}
          {(produto.estoqueReal ?? produto.estoque) != null && (
            <span className="badge-estoque">{produto.estoqueReal ?? produto.estoque} em estoque</span>
          )}
        </div>

        <div className="grid-info">
          <div className="info-card">
            <span className="info-card-label">Duração</span>
            <span>{produto.duration || 'não informada'}</span>
          </div>
          <div className="info-card">
            <span className="info-card-label">Onde ativa</span>
            <span>{ONDE_ATIVA}</span>
          </div>
          <div className="info-card">
            <span className="info-card-label">Tipo de link</span>
            <span>{TIPO_LINK}</span>
          </div>
          <div className="info-card">
            <span className="info-card-label">Entrega</span>
            <span>{ENTREGA_GRID}</span>
          </div>
        </div>

        {produto.description && (
          <div className="detalhe-bloco">
            <h4>Descrição completa</h4>
            <p className="detalhe-texto-livre">{produto.description}</p>
          </div>
        )}

        {produto.features?.length > 0 && (
          <div className="detalhe-bloco">
            <h4>O que está incluso</h4>
            <ul className="detalhe-lista">
              {produto.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detalhe-bloco">
          <h4>Como ativar</h4>
          <ol className="detalhe-lista-numerada">
            {passos.map((passo, indice) => (
              <li key={indice}>{passo}</li>
            ))}
          </ol>
        </div>

        {produto.aviso_prazo && <div className="aviso-prazo">{produto.aviso_prazo}</div>}

        <div className="detalhe-bloco">
          <h4>Ficha técnica</h4>
          <table className="ficha-tecnica">
            <tbody>
              <tr>
                <th>Marca</th>
                <td>{produto.brand}</td>
              </tr>
              <tr>
                <th>O que você recebe</th>
                <td>{entregaLabel}</td>
              </tr>
              <tr>
                <th>Duração</th>
                <td>{produto.duration || 'não informada'}</td>
              </tr>
              <tr>
                <th>Prazo de entrega</th>
                <td>{PRAZO_ENTREGA_FICHA}</td>
              </tr>
              <tr>
                <th>Garantia</th>
                <td>{GARANTIA_FICHA}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="selos-confianca">
          {SELOS_CONFIANCA.map(({ Icone, texto }) => (
            <span className="selo-confianca" key={texto}>
              <Icone />
              {texto}
            </span>
          ))}
        </div>

        <div className="detalhe-bloco">
          <h4>Informações importantes</h4>
          <p className="detalhe-texto-livre detalhe-texto-pequeno">{INFORMACOES_IMPORTANTES}</p>
        </div>

        {produto.resumo_final && <p className="resumo-final">{produto.resumo_final}</p>}

        <div className="detalhe-rodape">
          <span className="detalhe-total">
            Total: <strong>{formatarPreco(produto.price)}</strong>
          </span>
          <div className="acoes-formulario">
            <button onClick={onFechar}>Fechar</button>
            <button
              className="botao-primario"
              disabled={!(produto.disponivelReal ?? produto.available)}
              onClick={() => {
                onComprar(produto)
                onFechar()
              }}
            >
              Simular compra
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ProductDetailsModal
