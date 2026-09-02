import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabaseClient'
import { formatarPreco } from '../utils'

const STATUS_INFO = {
  aprovado: { texto: 'Aprovado', classe: 'status-badge-ok' },
  pendente: { texto: 'Pendente', classe: 'status-badge-pendente' },
  falhou: { texto: 'Falhou', classe: 'status-badge-erro' },
}

const ABAS = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'estoque', label: 'Estoque' },
]

const ESTOQUE_BAIXO_LIMITE = 3

function inicioDoDia(data) {
  const copia = new Date(data)
  copia.setHours(0, 0, 0, 0)
  return copia
}

// Calcula [início, fim] do período selecionado e o [início, fim] do período anterior de mesma
// duração, pra comparação percentual ("+15% vs semana passada").
function calcularPeriodos(periodo, dataInicio, dataFim) {
  const agora = new Date()
  let inicio
  let fim = agora

  if (periodo === 'hoje') {
    inicio = inicioDoDia(agora)
  } else if (periodo === '7d') {
    inicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (periodo === '30d') {
    inicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
  } else {
    inicio = dataInicio ? inicioDoDia(new Date(`${dataInicio}T00:00:00`)) : inicioDoDia(agora)
    fim = dataFim ? new Date(`${dataFim}T23:59:59`) : agora
  }

  const duracaoMs = Math.max(fim - inicio, 1)
  const inicioAnterior = new Date(inicio.getTime() - duracaoMs)
  const fimAnterior = inicio

  return { inicio, fim, inicioAnterior, fimAnterior }
}

function calcularVariacao(atual, anterior) {
  if (anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

function ChipVariacao({ valor }) {
  if (valor === null) return <span className="chip-variacao chip-variacao-neutra">sem dados antes</span>

  const positiva = valor >= 0
  const texto = `${positiva ? '+' : ''}${valor.toFixed(0)}% vs período anterior`
  return (
    <span className={`chip-variacao ${positiva ? 'chip-variacao-positiva' : 'chip-variacao-negativa'}`}>{texto}</span>
  )
}

function escaparCsv(valor) {
  return `"${String(valor ?? '').replace(/"/g, '""')}"`
}

function exportarCsv(pedidos) {
  const cabecalho = ['Data/hora', 'Cliente', 'Produto', 'Valor', 'Código', 'Status']
  const linhas = pedidos.map((pedido) => [
    new Date(pedido.created_at).toLocaleString('pt-BR'),
    pedido.user_email,
    pedido.product_name,
    Number(pedido.valor).toFixed(2).replace('.', ','),
    pedido.codigo || '',
    STATUS_INFO[pedido.status]?.texto || pedido.status,
  ])

  const conteudo = [cabecalho, ...linhas].map((linha) => linha.map(escaparCsv).join(';')).join('\r\n')
  const blob = new Blob([`﻿${conteudo}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function PedidosModal({ produtos, estoque, onFechar }) {
  const [aba, setAba] = useState('visao-geral')
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [periodo, setPeriodo] = useState('7d')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

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
    return pedidos.filter((pedido) => {
      const combinaTermo =
        !termo || pedido.user_email.toLowerCase().includes(termo) || pedido.product_name.toLowerCase().includes(termo)
      const combinaStatus = statusFiltro === 'todos' || pedido.status === statusFiltro
      return combinaTermo && combinaStatus
    })
  }, [pedidos, busca, statusFiltro])

  const visaoGeral = useMemo(() => {
    const { inicio, fim, inicioAnterior, fimAnterior } = calcularPeriodos(periodo, dataInicio, dataFim)

    function resumirPeriodo(de, ate) {
      const aprovados = pedidos.filter((pedido) => {
        if (pedido.status !== 'aprovado') return false
        const quando = new Date(pedido.created_at)
        return quando >= de && quando <= ate
      })

      const totalReais = aprovados.reduce((soma, pedido) => soma + Number(pedido.valor), 0)

      const contagemPorProduto = new Map()
      for (const pedido of aprovados) {
        contagemPorProduto.set(pedido.product_name, (contagemPorProduto.get(pedido.product_name) || 0) + 1)
      }
      const maisVendido = [...contagemPorProduto.entries()].sort((a, b) => b[1] - a[1])[0] || null

      return { totalVendas: aprovados.length, totalReais, maisVendido }
    }

    const atual = resumirPeriodo(inicio, fim)
    const anterior = resumirPeriodo(inicioAnterior, fimAnterior)
    const ticketMedio = atual.totalVendas > 0 ? atual.totalReais / atual.totalVendas : 0

    return {
      ...atual,
      ticketMedio,
      variacaoVendas: calcularVariacao(atual.totalVendas, anterior.totalVendas),
      variacaoReais: calcularVariacao(atual.totalReais, anterior.totalReais),
    }
  }, [pedidos, periodo, dataInicio, dataFim])

  const clientes = useMemo(() => {
    const mapa = new Map()
    for (const pedido of pedidos) {
      if (pedido.status !== 'aprovado') continue
      const atual = mapa.get(pedido.user_email) || { compras: 0, total: 0 }
      atual.compras += 1
      atual.total += Number(pedido.valor)
      mapa.set(pedido.user_email, atual)
    }
    return [...mapa.entries()].map(([email, dados]) => ({ email, ...dados })).sort((a, b) => b.total - a.total)
  }, [pedidos])

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-pedidos" onClick={(e) => e.stopPropagation()}>
        <h2>Pedidos</h2>

        <div className="abas-pedidos">
          {ABAS.map((item) => (
            <button
              key={item.id}
              className={`aba-botao ${aba === item.id ? 'ativa' : ''}`}
              onClick={() => setAba(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {carregando && <p className="vazio">Carregando...</p>}

        {!carregando && aba === 'visao-geral' && (
          <div className="aba-conteudo">
            <div className="filtro-periodo">
              {[
                { id: 'hoje', label: 'Hoje' },
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: 'custom', label: 'Personalizado' },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`filtro-periodo-botao ${periodo === item.id ? 'ativo' : ''}`}
                  onClick={() => setPeriodo(item.id)}
                >
                  {item.label}
                </button>
              ))}
              {periodo === 'custom' && (
                <div className="filtro-periodo-datas">
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                  <span>até</span>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              )}
            </div>

            <div className="pedidos-resumo">
              <div className="stat-card">
                <span className="stat-card-label">Vendas concluídas</span>
                <strong className="stat-card-valor">{visaoGeral.totalVendas}</strong>
                <ChipVariacao valor={visaoGeral.variacaoVendas} />
              </div>
              <div className="stat-card">
                <span className="stat-card-label">Total em vendas</span>
                <strong className="stat-card-valor">{formatarPreco(visaoGeral.totalReais)}</strong>
                <ChipVariacao valor={visaoGeral.variacaoReais} />
              </div>
              <div className="stat-card">
                <span className="stat-card-label">Ticket médio</span>
                <strong className="stat-card-valor">{formatarPreco(visaoGeral.ticketMedio)}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card-label">Produto mais vendido</span>
                {visaoGeral.maisVendido ? (
                  <>
                    <strong className="stat-card-valor stat-card-valor-produto">🏆 {visaoGeral.maisVendido[0]}</strong>
                    <span className="chip-variacao chip-variacao-neutra">{visaoGeral.maisVendido[1]} vendas</span>
                  </>
                ) : (
                  <span className="tabela-pedidos-vazio">Nenhuma venda no período.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {!carregando && aba === 'pedidos' && (
          <div className="aba-conteudo">
            <div className="modal-pedidos-cabecalho">
              <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                <option value="todos">Todos os status</option>
                <option value="aprovado">Aprovado</option>
                <option value="pendente">Pendente</option>
                <option value="falhou">Falhou</option>
              </select>
              <input
                type="search"
                placeholder="Buscar por e-mail ou produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button
                type="button"
                className="botao-secundario"
                disabled={pedidosFiltrados.length === 0}
                onClick={() => exportarCsv(pedidosFiltrados)}
              >
                Exportar CSV
              </button>
            </div>

            {pedidosFiltrados.length === 0 && <p className="vazio">Nenhum pedido encontrado.</p>}

            {pedidosFiltrados.length > 0 && (
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
                            {pedido.codigo ? (
                              <code>{pedido.codigo}</code>
                            ) : (
                              <span className="tabela-pedidos-vazio">—</span>
                            )}
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
          </div>
        )}

        {!carregando && aba === 'clientes' && (
          <div className="aba-conteudo">
            {clientes.length === 0 && <p className="vazio">Nenhum cliente com compra concluída ainda.</p>}

            {clientes.length > 0 && (
              <div className="tabela-pedidos-scroll">
                <table className="tabela-pedidos">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Compras</th>
                      <th>Total gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.email}>
                        <td>
                          <span className="celula-com-badge">
                            {cliente.email}
                            {cliente.compras > 1 && <span className="status-badge status-badge-ok">Fiel</span>}
                          </span>
                        </td>
                        <td>{cliente.compras}</td>
                        <td>{formatarPreco(cliente.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!carregando && aba === 'estoque' && (
          <div className="aba-conteudo">
            {(!produtos || produtos.length === 0) && <p className="vazio">Nenhum produto cadastrado.</p>}

            {produtos?.length > 0 && (
              <div className="tabela-pedidos-scroll">
                <table className="tabela-pedidos">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Códigos disponíveis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => {
                      const disponivel = estoque?.[produto.id] || 0
                      const baixo = disponivel < ESTOQUE_BAIXO_LIMITE
                      return (
                        <tr key={produto.id}>
                          <td>{produto.name}</td>
                          <td>
                            <span className="celula-com-badge">
                              {disponivel}
                              {baixo && <span className="status-badge status-badge-erro">Estoque baixo</span>}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
