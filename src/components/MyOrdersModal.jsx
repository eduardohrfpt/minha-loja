import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatarPreco } from '../utils'
import CodigoDetalheModal from './CodigoDetalheModal'
import IconeProduto from './IconeProduto'

function MyOrdersModal({ onFechar }) {
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
    <div className="overlay" onClick={onFechar}>
      <div className="modal-estoque" onClick={(e) => e.stopPropagation()}>
        <h2>Minhas compras</h2>

        {carregando && <p className="vazio">Carregando...</p>}
        {!carregando && pedidos.length === 0 && <p className="vazio">Você ainda não fez nenhuma compra.</p>}

        <div className="estoque-lista">
          {pedidos.map((pedido) => {
            const codigo = pedido.codigos_produto?.[0]?.codigo
            return (
              <div
                className={`pedido-item ${codigo ? 'pedido-item-clicavel' : ''}`}
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
                <div className="pedido-item-topo">
                  <IconeProduto produto={pedido.products} className="icone-marca" />
                  <div>
                    <strong>{pedido.products?.name}</strong>
                    <span className="card-marca">{pedido.products?.brand}</span>
                  </div>
                  <span className="pedido-preco">{formatarPreco(pedido.products?.price)}</span>
                </div>
                <div className="pedido-item-detalhe">
                  <span>{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                  {codigo && <code>{codigo}</code>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="acoes-formulario">
          <button onClick={onFechar}>Fechar</button>
        </div>
      </div>

      {pedidoSelecionado && (
        <CodigoDetalheModal
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

export default MyOrdersModal
