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

  // Resumo sempre reflete TODOS os pedidos, não só o que a busca está filtrando na tabela.
  const resumo = useMemo(() => {
    const aprovados = pedidos.filter((pedido) => pedido.status === 'aprovado')
    const totalReais = aprovados.reduce((soma, pedido) => soma + Number(pedido.valor), 0)

    const contagemPorProduto = new Map()
    for (const pedido of aprovados) {
      contagemPorProduto.set(pedido.product_name, (contagemPorProduto.get(pedido.product_name) || 0) + 1)
    }
    const vendasPorProduto = [...contagemPorProduto.entries()].sort((a, b) => b[1] - a[1])

    return { totalVendas: aprovados.length, totalReais, vendasPorProduto }
  }, [pedidos])

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-pedidos" onClick={(e) => e.stopPropagation()}>
        <h2>Pedidos</h2>

        {!carregando && (
          <div className="pedidos-resumo">
            <div className="stat-card">
              <span className="stat-card-label">Vendas concluídas</span>
              <strong className="stat-card-valor">{resumo.totalVendas}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total em vendas</span>
              <strong className="stat-card-valor">{formatarPreco(resumo.totalReais)}</strong>
            </div>
            <div className="stat-card stat-card-produtos">
              <span className="stat-card-label">Vendas por produto</span>
              {resumo.vendasPorProduto.length === 0 ? (
                <span className="tabela-pedidos-vazio">Nenhuma venda concluída ainda.</span>
              ) : (
                <ul className="stat-card-lista">
                  {resumo.vendasPorProduto.map(([nome, quantidade]) => (
                    <li key={nome}>
                      <span>{nome}</span>
                      <strong>{quantidade}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="modal-pedidos-cabecalho">
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
