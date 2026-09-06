import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { formatarPreco } from '../../utils'
import IconeProduto from '../../components/IconeProduto'
import V2CodigoDetalheModal from './V2CodigoDetalheModal'
import { IconPackage } from './v2icons'

function V2MyOrdersModal({ onFechar }) {
  const { usuario } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, created_at, status, products(name, brand, image, image_url, price, guia_uso_codigo), codigos_produto(codigo)',
        )
        .eq('user_id', usuario.id)
        .order('created_at', { ascending: false })

      setCarregando(false)
      if (error) {
        console.error(error)
        return
      }
      setPedidos(data)
    }
    carregar()
  }, [usuario.id])

  return createPortal(
    <div className="v2-shell v2-overlay" onClick={onFechar}>
      <div className="v2-modal v2-modal-pedidos-cliente" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-topo">
          <span className="v2-modal-icone">
            <IconPackage />
          </span>
          <div>
            <h2>Minhas compras</h2>
            <p className="v2-modal-subtitulo">Seus códigos e o histórico de tudo o que você já comprou.</p>
          </div>
        </div>

        {carregando && <p className="v2-vazio">Carregando...</p>}
        {!carregando && pedidos.length === 0 && <p className="v2-vazio">Você ainda não fez nenhuma compra.</p>}

        <div className="v2-lista-pedidos">
          {pedidos.map((pedido) => {
            const codigo = pedido.codigos_produto?.[0]?.codigo
            return (
              <div
                className={`v2-pedido-item ${codigo ? 'v2-pedido-item--clicavel' : ''}`}
                key={pedido.id}
                {...(codigo && {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => setPedidoSelecionado(pedido),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPedidoSelecionado(pedido)
                    }
                  },
                })}
              >
                <div className="v2-pedido-item-topo">
                  <IconeProduto produto={pedido.products} className="v2-card-icone v2-card-icone--sm" />
                  <div className="v2-card-titulo">
                    <strong>{pedido.products?.name}</strong>
                    <span className="v2-card-marca">{pedido.products?.brand}</span>
                  </div>
                  <span className="v2-preco-final v2-preco-final--sm">{formatarPreco(pedido.products?.price)}</span>
                </div>
                <div className="v2-pedido-item-detalhe">
                  <span>{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                  {codigo ? (
                    <code>{codigo}</code>
                  ) : (
                    pedido.status === 'preparando_entrega' && (
                      <span className="v2-status-badge v2-status-badge--pendente">Preparando entrega</span>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button className="v2-botao v2-botao--fantasma v2-botao--bloco" onClick={onFechar}>
          Fechar
        </button>
      </div>

      {pedidoSelecionado && (
        <V2CodigoDetalheModal
          produtoNome={pedidoSelecionado.products?.name}
          codigo={pedidoSelecionado.codigos_produto?.[0]?.codigo}
          guiaUso={pedidoSelecionado.products?.guia_uso_codigo}
          onFechar={() => setPedidoSelecionado(null)}
        />
      )}
    </div>,
    document.body,
  )
}

export default V2MyOrdersModal
