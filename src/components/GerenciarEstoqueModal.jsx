import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabaseClient'

function GerenciarEstoqueModal({ produto, onFechar, onEstoqueAlterado }) {
  const [codigos, setCodigos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novosCodigos, setNovosCodigos] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregarCodigos() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('codigos_produto')
      .select('id, codigo, usado, created_at')
      .eq('product_id', produto.id)
      .order('created_at')
    setCarregando(false)
    if (error) {
      alert(`Erro ao carregar códigos: ${error.message}`)
      return
    }
    setCodigos(data)
  }

  useEffect(() => {
    carregarCodigos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produto.id])

  async function adicionarCodigos(e) {
    e.preventDefault()
    const linhas = novosCodigos
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean)

    if (linhas.length === 0) return

    setSalvando(true)
    const { error } = await supabase
      .from('codigos_produto')
      .insert(linhas.map((codigo) => ({ product_id: produto.id, codigo })))
    setSalvando(false)

    if (error) {
      alert(`Erro ao adicionar códigos: ${error.message}`)
      return
    }

    setNovosCodigos('')
    await carregarCodigos()
    onEstoqueAlterado?.()
  }

  const disponiveis = codigos.filter((c) => !c.usado)
  const usados = codigos.filter((c) => c.usado)

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <div className="modal-estoque" onClick={(e) => e.stopPropagation()}>
        <h2>Estoque de códigos — {produto.name}</h2>

        <div className="estoque-resumo">
          <span className="badge-estoque">{disponiveis.length} disponíveis</span>
          <span className="badge-estoque badge-usado">{usados.length} usados</span>
        </div>

        <form onSubmit={adicionarCodigos} className="estoque-form">
          <label>
            Adicionar códigos (um por linha)
            <textarea
              rows={4}
              value={novosCodigos}
              onChange={(e) => setNovosCodigos(e.target.value)}
              placeholder={'CODIGO-ABC123\nCODIGO-DEF456'}
            />
          </label>
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? 'Adicionando...' : 'Adicionar códigos'}
          </button>
        </form>

        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : (
          <div className="estoque-lista">
            {codigos.length === 0 && <p className="vazio">Nenhum código cadastrado ainda.</p>}
            {codigos.map((c) => (
              <div className="estoque-linha" key={c.id}>
                <code>{c.codigo}</code>
                <span className={`badge-estoque ${c.usado ? 'badge-usado' : ''}`}>
                  {c.usado ? 'Usado' : 'Disponível'}
                </span>
              </div>
            ))}
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

export default GerenciarEstoqueModal
