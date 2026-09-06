import { createPortal } from 'react-dom'
import { formatarPreco } from '../../utils'
import IconeProduto from '../../components/IconeProduto'
import { IconCheck, IconShield, IconLock, IconHeadset, IconBolt, IconPackage, IconX } from './v2icons'

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

function V2ProductDetailsModal({ produto, onFechar, onComprar }) {
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
    <div className="v2-shell v2-overlay" onClick={onFechar}>
      <div className="v2-modal v2-modal-produto" onClick={(e) => e.stopPropagation()}>
        <button className="v2-modal-fechar" onClick={onFechar} aria-label="Fechar">
          <IconX />
        </button>

        <div className="v2-detalhe-scroll">
          <div className="v2-detalhe-imagem">
            <IconeProduto produto={produto} className="v2-detalhe-imagem-conteudo" />
          </div>

          <div className="v2-detalhe-titulo-bloco">
            <span className="v2-card-marca">{produto.brand}</span>
            <h2>{produto.name}</h2>
            <div className="v2-detalhe-preco-linha">
              <div className="v2-card-precos-linha">
                {produto.discount > 0 && <span className="v2-preco-riscado">{formatarPreco(produto.original_price)}</span>}
                {produto.discount > 0 && <span className="v2-etiqueta-desconto">-{produto.discount}%</span>}
              </div>
              <span className="v2-preco-final">{formatarPreco(produto.price)}</span>
              {estoque != null && <span className="v2-badge-estoque">{estoque} em estoque</span>}
            </div>
          </div>

          <div className="v2-detalhe-icones-rapidos">
            <div className="v2-icone-rapido">
              <IconBolt />
              <div>
                <strong>Entrega</strong>
                <span>{ENTREGA_RESUMO}</span>
              </div>
            </div>
            <div className="v2-icone-rapido">
              <IconPackage />
              <div>
                <strong>Duração</strong>
                <span>{produto.duration || 'Não informada'}</span>
              </div>
            </div>
            <div className="v2-icone-rapido">
              <IconLock />
              <div>
                <strong>Acesso</strong>
                <span>{TIPO_ACESSO}</span>
              </div>
            </div>
          </div>

          {descricaoCurta && <p className="v2-detalhe-descricao">{descricaoCurta}</p>}

          {itensIncluidos.length > 0 && (
            <div className="v2-detalhe-bloco">
              <h4>O que está incluído</h4>
              <ul className="v2-lista-check">
                {itensIncluidos.map((item) => (
                  <li key={item}>
                    <IconCheck className="v2-icone-check" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="v2-detalhe-bloco">
            <h4>Como funciona a entrega</h4>
            <p className="v2-texto-livre">{EXPLICACAO_ENTREGA}</p>
            {produto.aviso_prazo && <p className="v2-aviso-prazo">{produto.aviso_prazo}</p>}
          </div>

          {passosAtivacao?.length > 0 && (
            <div className="v2-detalhe-bloco">
              <h4>Como ativar</h4>
              <ol className="v2-lista-numerada">
                {passosAtivacao.map((passo, indice) => (
                  <li key={indice}>{passo}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="v2-detalhe-bloco">
            <h4>Ficha técnica</h4>
            <table className="v2-ficha-tecnica">
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

          <div className="v2-detalhe-bloco">
            <h4>Garantias da compra</h4>
            <div className="v2-selos-confianca">
              {SELOS_CONFIANCA.map(({ Icone, texto }) => (
                <span className="v2-selo-confianca" key={texto}>
                  <Icone />
                  {texto}
                </span>
              ))}
            </div>
          </div>

          <p className="v2-texto-livre v2-texto-pequeno">{AVISO_CURTO}</p>
        </div>

        <div className="v2-detalhe-rodape">
          <span className="v2-detalhe-total">
            Total: <strong>{formatarPreco(produto.price)}</strong>
          </span>
          <div className="v2-modal-rodape-acoes">
            <button className="v2-botao v2-botao--fantasma" onClick={onFechar}>
              Fechar
            </button>
            <button
              className="v2-botao v2-botao--ouro v2-botao--grande"
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

export default V2ProductDetailsModal
