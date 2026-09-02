import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabaseClient'
import { formatarPreco } from '../utils'

const STATUS_INFO = {
  aprovado: { texto: 'Aprovado', classe: 'status-badge-ok' },
  pendente: { texto: 'Pendente', classe: 'status-badge-pendente' },
  falhou: { texto: 'Falhou', classe: 'status-badge-erro' },
}

function PedidosModal({ onFechar }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('historico_pedidos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      setCarregando(false)
      if (error) {
        console.error(error)
        return
      }
      setPedidos(data)
    }
    carregar()
  }, [])

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return pedidos
    return pedidos.filter(
      (pedido) =>
        pedido.user_email.toLowerCase().includes(termo) || pedido.product_name.toLowerCase().includes(termo),
    )
  }, [pedidos, busca])

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-pedidos" onClick={(e) => e.stopPropagation()}>
        <div className="modal-pedidos-cabecalho">
          <h2>Pedidos</h2>
          <input
            type="search"
            placeholder="Buscar por e-mail ou produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando && <p className="vazio">Carregando...</p>}
        {!carregando && pedidosFiltrados.length === 0 && <p className="vazio">Nenhum pedido encontrado.</p>}

        {!carregando && pedidosFiltrados.length > 0 && (
          <div className="tabela-pedidos-scroll">
            <table className="tabela-pedidos">
              <thead>
                <tr>
                  <th>Data/hora</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Valor</th>
                  <th>Código</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const status = STATUS_INFO[pedido.status] || STATUS_INFO.pendente
                  return (
                    <tr key={pedido.id}>
                      <td>{new Date(pedido.created_at).toLocaleString('pt-BR')}</td>
                      <td>{pedido.user_email}</td>
                      <td>{pedido.product_name}</td>
                      <td>{formatarPreco(pedido.valor)}</td>
                      <td>
                        {pedido.codigo ? <code>{pedido.codigo}</code> : <span className="tabela-pedidos-vazio">—</span>}
                      </td>
                      <td>
                        <span className={`status-badge ${status.classe}`}>{status.texto}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="acoes-formulario">
          <button onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default PedidosModal
