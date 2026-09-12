import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { formatarPreco } from '../utils'
import { IconCheck, IconShield, IconLock, IconHeadset, IconBolt, IconPackage } from './icons'
import IconeProduto from './IconeProduto'

const TIPO_ACESSO = 'Na sua própria conta'
const O_QUE_RECEBE = 'Código ou link de ativação, para uso na sua própria conta'
const GARANTIA_FICHA = 'Reembolso integral se a entrega falhar'

const SELOS_CONFIANCA = [
  { Icone: IconShield, texto: 'Não recebeu? Devolvemos 100%' },
  {
    Icone: IconLock,
    texto: 'Pagamento pelo Mercado Pago — os dados do seu cartão não passam pela nossa loja em nenhum momento',
  },
  { Icone: IconHeadset, texto: 'Suporte humano' },
]

const AVISO_CURTO =
  'Ao ativar o código, você aceita os termos da plataforma original; a compra não pode ser trocada ou estornada após a ativação.'

// ATENÇÃO -- texto voltado ao cliente, não mexer sem reler isto:
// Pra alguns produtos (delivery_type = "manual"), a entrega de verdade é feita por uma pessoa
// da equipe, que recebe um aviso no Telegram e responde com a chave (ver
// api/mercadopago-webhook.js e api/telegram-webhook.js) -- às vezes levando mais que 10
// minutos em dias de alta demanda. Isso é implementação interna. Pro cliente, a entrega é
// SEMPRE apresentada como automática e dentro de até 10 minutos, sem citar Telegram, e-mail,
// "equipe" ou qualquer pessoa/processo manual -- é por isso que os textos abaixo não variam
// por delivery_type. Não reintroduza essa distinção aqui.
const ENTREGA_RESUMO = 'Até 10 min'
const EXPLICACAO_ENTREGA =
  'Nosso sistema realiza a entrega automaticamente. O prazo típico é de até 10 minutos após a confirmação do pagamento.'
const PRAZO_ENTREGA_FICHA = 'Até 10 minutos após a confirmação do pagamento'

// Fica num componente à parte (em vez de calcular tudo direto em ProductDetailsModal, antes de
// um "if (!produto) return null") porque o AnimatePresence logo abaixo precisa continuar
// renderizando a árvore durante a animação de saída -- sem esse "return null" antecipado, o
// modal sumiria na hora em vez de fechar com transição.
function ConteudoModalProduto({ produto, onFechar, onComprar }) {
  const reduzirMovimento = useReducedMotion()

  // Isto aqui é só uma decisão de UI (esconder um número de estoque que não existiria de
  // verdade pra esses produtos) -- não expõe nem menciona nada sobre o processo de entrega
  // pro cliente, então não conflita com o aviso acima.
  const estoque = produto.delivery_type === 'manual' ? null : produto.estoqueReal ?? produto.estoque
  const itensIncluidos = Array.from(
    new Set([...(produto.beneficios || []), ...(produto.features || [])].map((item) => item.trim()).filter(Boolean)),
  )
  const descricaoCurta = produto.description || produto.resumo_final || produto.tagline
  const passosAtivacao = produto.instrucoes_ativacao
    ?.split('\n')
    .map((passo) => passo.trim().replace(/^\d+\s*[-.).]\s*/, ''))
    .filter(Boolean)

  return (
    <motion.div
      className="overlay"
      onClick={onFechar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduzirMovimento ? 0 : 0.18 }}
    >
      <motion.div
        className="modal-detalhes-completo"
        onClick={(e) => e.stopPropagation()}
        initial={reduzirMovimento ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduzirMovimento ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: reduzirMovimento ? 0.12 : 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="detalhe-scroll">
          <div className="detalhe-imagem-grande">
            <IconeProduto produto={produto} className="detalhe-imagem-conteudo" />
          </div>

          <div className="detalhe-titulo-bloco">
            <h3>{produto.name}</h3>
            <span className="card-marca">{produto.brand}</span>
            <div className="detalhe-preco-linha">
              {produto.preco_referencia > 0 && (
                <div className="preco-referencia-bloco">
                  <span className="preco-referencia-valor">{formatarPreco(produto.preco_referencia)}</span>
                  <span className="preco-referencia-legenda">Você paga bem menos que o preço oficial</span>
                </div>
              )}
              <div className="precos-linha">
                {produto.discount > 0 && (
                  <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
                )}
                {produto.discount > 0 && <span className="etiqueta-desconto">-{produto.discount}%</span>}
              </div>
              <span className="preco-final">{formatarPreco(produto.price)}</span>
              {estoque != null && (
                <span className="badge-estoque">
                  {estoque === 0 ? 'Esgotado' : `${estoque} ${estoque === 1 ? 'unidade disponível' : 'unidades disponíveis'}`}
                </span>
              )}
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
      </motion.div>
    </motion.div>
  )
}

function ProductDetailsModal({ produto, onFechar, onComprar }) {
  return createPortal(
    <AnimatePresence>
      {produto && <ConteudoModalProduto produto={produto} onFechar={onFechar} onComprar={onComprar} />}
    </AnimatePresence>,
    document.body,
  )
}

export default ProductDetailsModal
