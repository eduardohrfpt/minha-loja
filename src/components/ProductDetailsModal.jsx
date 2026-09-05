import { createPortal } from 'react-dom'
import { formatarPreco } from '../utils'
import { IconCheck, IconShield, IconLock, IconHeadset, IconBolt, IconPackage } from './icons'
import IconeProduto from './IconeProduto'

const TIPO_ACESSO = 'Na sua própria conta'
const O_QUE_RECEBE = 'Código ou link de ativação, para uso na sua própria conta'
const GARANTIA_FICHA = 'Reembolso integral se a entrega falhar'

const SELOS_CONFIANCA = [
  { Icone: IconShield, texto: 'Não recebeu? Devolvemos 100%' },
  { Icone: IconLock, texto: 'Pagamento pelo Mercado Pago' },
  { Icone: IconHeadset, texto: 'Suporte humano' },
]

const AVISO_CURTO =
  'Ao ativar o código, você aceita os termos da plataforma original; a compra não pode ser trocada ou estornada após a ativação.'

const ENTREGA_RESUMO = 'Até 10 min'
const EXPLICACAO_ENTREGA =
  'Nosso sistema realiza a entrega automaticamente. O prazo típico é de até 10 minutos após a confirmação do pagamento.'
const PRAZO_ENTREGA_FICHA = 'Até 10 minutos após a confirmação do pagamento'

function ProductDetailsModal({ produto, onFechar, onComprar }) {
  if (!produto) return null

  const estoque = produto.estoqueReal ?? produto.estoque
  const itensIncluidos = Array.from(
    new Set([...(produto.beneficios || []), ...(produto.features || [])].map((item) => item.trim()).filter(Boolean)),
  )
  const descricaoCurta = produto.description || produto.resumo_final || produto.tagline
  const passosAtivacao = produto.instrucoes_ativacao
    ?.split('\n')
    .map((passo) => passo.trim().replace(/^\d+\s*[-.).]\s*/, ''))
    .filter(Boolean)

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-detalhes-completo" onClick={(e) => e.stopPropagation()}>
        <div className="detalhe-scroll">
          <div className="detalhe-imagem-grande">
            <IconeProduto produto={produto} className="detalhe-imagem-conteudo" />
          </div>

          <div className="detalhe-titulo-bloco">
            <h3>{produto.name}</h3>
            <span className="card-marca">{produto.brand}</span>
            <div className="detalhe-preco-linha">
              <div className="precos-linha">
                {produto.discount > 0 && (
                  <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
                )}
                {produto.discount > 0 && <span className="etiqueta-desconto">-{produto.discount}%</span>}
              </div>
              <span className="preco-final">{formatarPreco(produto.price)}</span>
              {estoque != null && <span className="badge-estoque">{estoque} em estoque</span>}
            </div>
          </div>

          <div className="detalhe-icones-rapidos">
            <div className="icone-rapido">
              <IconBolt className="icone-rapido-svg" />
              <div>
                <strong>Entrega</strong>
                <span>{ENTREGA_RESUMO}</span>
              </div>
            </div>
            <div className="icone-rapido">
              <IconPackage className="icone-rapido-svg" />
              <div>
                <strong>Duração</strong>
                <span>{produto.duration || 'Não informada'}</span>
              </div>
            </div>
            <div className="icone-rapido">
              <IconLock className="icone-rapido-svg" />
              <div>
                <strong>Acesso</strong>
                <span>{TIPO_ACESSO}</span>
              </div>
            </div>
          </div>

          {descricaoCurta && <p className="detalhe-descricao-curta">{descricaoCurta}</p>}

          {itensIncluidos.length > 0 && (
            <div className="detalhe-bloco">
              <h4>O que está incluído</h4>
              <ul className="detalhe-lista-check">
                {itensIncluidos.map((item) => (
                  <li key={item}>
                    <IconCheck className="icone-check" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="detalhe-bloco">
            <h4>Como funciona a entrega</h4>
            <p className="detalhe-texto-livre">{EXPLICACAO_ENTREGA}</p>
            {produto.aviso_prazo && <p className="aviso-prazo aviso-prazo-inline">{produto.aviso_prazo}</p>}
          </div>

          {passosAtivacao?.length > 0 && (
            <div className="detalhe-bloco">
              <h4>Como ativar</h4>
              <ol className="detalhe-lista-numerada">
                {passosAtivacao.map((passo, indice) => (
                  <li key={indice}>{passo}</li>
                ))}
              </ol>
            </div>
          )}

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
                  <td>{O_QUE_RECEBE}</td>
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

          <div className="detalhe-bloco">
            <h4>Garantias da compra</h4>
            <div className="selos-confianca">
              {SELOS_CONFIANCA.map(({ Icone, texto }) => (
                <span className="selo-confianca" key={texto}>
                  <Icone />
                  {texto}
                </span>
              ))}
            </div>
          </div>

          <p className="detalhe-texto-livre detalhe-texto-pequeno detalhe-aviso-curto">{AVISO_CURTO}</p>
        </div>

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
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ProductDetailsModal
