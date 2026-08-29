import { useState } from 'react'
import { formatarPreco, precoComDesconto } from '../utils'

const formVazio = {
  nome: '',
  marca: '',
  preco: '',
  desconto: '',
  imagem: '✨',
  selo: '',
  disponivel: true,
  descricao: '',
}

function Catalog({ produtos, setProdutos, modoAdmin }) {
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [form, setForm] = useState(formVazio)
  const [produtoDetalhe, setProdutoDetalhe] = useState(null)

  function abrirFormularioNovo() {
    setForm(formVazio)
    setProdutoEditando('novo')
  }

  function abrirFormularioEdicao(produto) {
    setForm({
      nome: produto.nome,
      marca: produto.marca,
      preco: produto.preco,
      desconto: produto.desconto,
      imagem: produto.imagem,
      selo: produto.selo || '',
      disponivel: produto.disponivel,
      descricao: produto.descricao || '',
    })
    setProdutoEditando(produto.id)
  }

  function salvarProduto(e) {
    e.preventDefault()
    const preco = parseFloat(form.preco)
    const desconto = parseFloat(form.desconto) || 0

    if (!form.nome || !form.marca || Number.isNaN(preco)) {
      alert('Preencha nome, marca e um preço válido.')
      return
    }

    const dadosProduto = {
      nome: form.nome,
      marca: form.marca,
      preco,
      desconto,
      imagem: form.imagem || '🛒',
      selo: form.selo,
      disponivel: form.disponivel,
      descricao: form.descricao,
    }

    if (produtoEditando === 'novo') {
      setProdutos((prev) => [...prev, { id: Date.now(), ...dadosProduto }])
    } else {
      setProdutos((prev) =>
        prev.map((p) => (p.id === produtoEditando ? { ...p, ...dadosProduto } : p)),
      )
    }
    setProdutoEditando(null)
  }

  function removerProduto(id) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      setProdutos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  function comprar(produto) {
    const precoFinal = formatarPreco(precoComDesconto(produto.preco, produto.desconto))
    alert(`Compra simulada: ${produto.nome} por ${precoFinal}`)
  }

  return (
    <section id="produtos" className="secao">
      <div className="secao-cabecalho">
        <h2>Catálogo</h2>
        <p>Todas as assinaturas disponíveis, com desconto já aplicado.</p>
      </div>

      {modoAdmin && (
        <div className="painel-admin">
          <button className="botao-novo" onClick={abrirFormularioNovo}>
            + Novo produto
          </button>
        </div>
      )}

      <div className="grade">
        {produtos.map((produto) => {
          const precoFinal = precoComDesconto(produto.preco, produto.desconto)
          return (
            <div className="card" key={produto.id}>
              {produto.selo && <span className="selo">{produto.selo}</span>}
              <div className="card-topo">
                <span className="icone-marca">{produto.imagem}</span>
                <div>
                  <h3>{produto.nome}</h3>
                  <span className="card-marca">{produto.marca}</span>
                </div>
              </div>

              <span className={`disponibilidade ${produto.disponivel ? 'ok' : 'indisponivel'}`}>
                <i />
                {produto.disponivel ? 'Em estoque' : 'Indisponível'}
              </span>

              <div className="precos">
                <div className="precos-linha">
                  {produto.desconto > 0 && (
                    <span className="preco-antigo">{formatarPreco(produto.preco)}</span>
                  )}
                  {produto.desconto > 0 && <span className="etiqueta-desconto">-{produto.desconto}%</span>}
                </div>
                <span className="preco-final">{formatarPreco(precoFinal)}</span>
              </div>

              <div className="card-acoes">
                <button className="botao-secundario" onClick={() => setProdutoDetalhe(produto)}>
                  Detalhes
                </button>
                <button
                  className="botao-primario"
                  disabled={!produto.disponivel}
                  onClick={() => comprar(produto)}
                >
                  Comprar
                </button>
              </div>

              {modoAdmin && (
                <div className="acoes-admin">
                  <button onClick={() => abrirFormularioEdicao(produto)}>Editar</button>
                  <button className="botao-remover" onClick={() => removerProduto(produto.id)}>
                    Remover
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {produtos.length === 0 && <p className="vazio">Nenhum produto cadastrado.</p>}
      </div>

      {produtoDetalhe && (
        <div className="overlay" onClick={() => setProdutoDetalhe(null)}>
          <div className="modal-detalhes" onClick={(e) => e.stopPropagation()}>
            <span className="icone-marca icone-marca-grande">{produtoDetalhe.imagem}</span>
            <h3>{produtoDetalhe.nome}</h3>
            <span className="card-marca">{produtoDetalhe.marca}</span>
            <p className="descricao-produto">
              {produtoDetalhe.descricao || 'Assinatura oficial, ativação garantida após a confirmação da compra.'}
            </p>
            <span className={`disponibilidade ${produtoDetalhe.disponivel ? 'ok' : 'indisponivel'}`}>
              <i />
              {produtoDetalhe.disponivel ? 'Em estoque' : 'Indisponível'}
            </span>
            <span className="preco-final">
              {formatarPreco(precoComDesconto(produtoDetalhe.preco, produtoDetalhe.desconto))}
            </span>
            <div className="acoes-formulario">
              <button onClick={() => setProdutoDetalhe(null)}>Fechar</button>
              <button
                className="botao-primario"
                disabled={!produtoDetalhe.disponivel}
                onClick={() => {
                  comprar(produtoDetalhe)
                  setProdutoDetalhe(null)
                }}
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      )}

      {produtoEditando && (
        <div className="overlay" onClick={() => setProdutoEditando(null)}>
          <form className="formulario" onClick={(e) => e.stopPropagation()} onSubmit={salvarProduto}>
            <h2>{produtoEditando === 'novo' ? 'Novo produto' : 'Editar produto'}</h2>

            <label>
              Emoji/ícone
              <input value={form.imagem} onChange={(e) => setForm({ ...form, imagem: e.target.value })} placeholder="🤖" />
            </label>
            <label>
              Nome
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </label>
            <label>
              Marca
              <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
            </label>
            <label>
              Preço (R$)
              <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required />
            </label>
            <label>
              Desconto (%)
              <input type="number" step="1" value={form.desconto} onChange={(e) => setForm({ ...form, desconto: e.target.value })} />
            </label>
            <label>
              Selo (opcional)
              <input value={form.selo} onChange={(e) => setForm({ ...form, selo: e.target.value })} placeholder="Mais vendido" />
            </label>
            <label>
              Descrição
              <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.disponivel}
                onChange={(e) => setForm({ ...form, disponivel: e.target.checked })}
              />
              Disponível em estoque
            </label>

            <div className="acoes-formulario">
              <button type="button" onClick={() => setProdutoEditando(null)}>
                Cancelar
              </button>
              <button type="submit" className="botao-primario">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Catalog
