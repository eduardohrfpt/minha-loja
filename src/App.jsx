import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'catalogo-produtos'

const produtosIniciais = [
  { id: 1, nome: 'ChatGPT Plus', marca: 'OpenAI', preco: 97.9, desconto: 10, imagem: '🤖' },
  { id: 2, nome: 'Notion Plus', marca: 'Notion', preco: 40, desconto: 0, imagem: '📝' },
  { id: 3, nome: 'Spotify Premium', marca: 'Spotify', preco: 21.9, desconto: 15, imagem: '🎵' },
  { id: 4, nome: 'Netflix Padrão', marca: 'Netflix', preco: 44.9, desconto: 0, imagem: '🎬' },
]

function carregarProdutos() {
  const salvos = localStorage.getItem(STORAGE_KEY)
  return salvos ? JSON.parse(salvos) : produtosIniciais
}

function precoComDesconto(preco, desconto) {
  return preco - (preco * desconto) / 100
}

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formVazio = { nome: '', marca: '', preco: '', desconto: '', imagem: '✨' }

function App() {
  const [produtos, setProdutos] = useState(carregarProdutos)
  const [modoAdmin, setModoAdmin] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [form, setForm] = useState(formVazio)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos))
  }, [produtos])

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

    if (produtoEditando === 'novo') {
      const novoProduto = {
        id: Date.now(),
        nome: form.nome,
        marca: form.marca,
        preco,
        desconto,
        imagem: form.imagem || '🛒',
      }
      setProdutos((prev) => [...prev, novoProduto])
    } else {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produtoEditando
            ? { ...p, nome: form.nome, marca: form.marca, preco, desconto, imagem: form.imagem }
            : p,
        ),
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
    <div className="app">
      <header className="topo">
        <h1>Catálogo de Assinaturas Digitais</h1>
        <button
          className={`botao-admin ${modoAdmin ? 'ativo' : ''}`}
          onClick={() => setModoAdmin((v) => !v)}
        >
          {modoAdmin ? 'Sair do modo admin' : 'Entrar no modo admin'}
        </button>
      </header>

      {modoAdmin && (
        <div className="painel-admin">
          <button className="botao-novo" onClick={abrirFormularioNovo}>
            + Novo produto
          </button>
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

            <div className="acoes-formulario">
              <button type="button" onClick={() => setProdutoEditando(null)}>
                Cancelar
              </button>
              <button type="submit" className="botao-salvar">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="grade">
        {produtos.map((produto) => {
          const precoFinal = precoComDesconto(produto.preco, produto.desconto)
          return (
            <div className="card" key={produto.id}>
              {produto.desconto > 0 && <span className="etiqueta-desconto">-{produto.desconto}%</span>}
              <div className="icone">{produto.imagem}</div>
              <h3>{produto.nome}</h3>
              <p className="marca">{produto.marca}</p>
              <div className="precos">
                {produto.desconto > 0 && <span className="preco-antigo">{formatarPreco(produto.preco)}</span>}
                <span className="preco-final">
                  {formatarPreco(precoFinal)}
                  <small>/mês</small>
                </span>
              </div>
              <button className="botao-comprar" onClick={() => comprar(produto)}>
                Comprar
              </button>

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
      </main>
    </div>
  )
}

export default App
