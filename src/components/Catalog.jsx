import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatarPreco } from '../utils'
import { useAuth } from '../context/AuthContext'
import ProductDetailsModal from './ProductDetailsModal'
import GerenciarEstoqueModal from './GerenciarEstoqueModal'
import PedidosModal from './PedidosModal'

const formVazio = {
  name: '',
  brand: '',
  image: '✨',
  badges: '',
  available: true,
  delivery_type: 'imediata',
  duration: '',
  original_price: '',
  discount: '',
  description: '',
  features: [],
  tagline: '',
  beneficios: [],
  estoque: '',
  passos_ativacao: [],
  guia_uso_codigo: [],
  aviso_prazo: '',
  resumo_final: '',
}

function CampoLista({ label, itens, aoAdicionar, aoAtualizar, aoRemover, placeholder }) {
  return (
    <label>
      {label}
      <div className="lista-itens">
        {itens.map((item, indice) => (
          <div className="lista-itens-linha" key={indice}>
            <input value={item} onChange={(e) => aoAtualizar(indice, e.target.value)} placeholder={placeholder} />
            <button type="button" onClick={() => aoRemover(indice)} aria-label="Remover item">
              ×
            </button>
          </div>
        ))}
        <button type="button" className="botao-add-item" onClick={aoAdicionar}>
          + Adicionar item
        </button>
      </div>
    </label>
  )
}

function Catalog({ produtos, estoque, recarregarProdutos, modoAdmin }) {
  const { usuario, isAdmin } = useAuth()
  const adminAtivo = modoAdmin && isAdmin

  const [produtoEditando, setProdutoEditando] = useState(null)
  const [form, setForm] = useState(formVazio)
  const [produtoDetalhe, setProdutoDetalhe] = useState(null)
  const [produtoEstoque, setProdutoEstoque] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [comprando, setComprando] = useState(null)
  const [produtoConfirmando, setProdutoConfirmando] = useState(null)
  const [pedidosAbertos, setPedidosAbertos] = useState(false)

  function abrirFormularioNovo() {
    if (!adminAtivo) return
    setForm(formVazio)
    setProdutoEditando('novo')
  }

  function abrirFormularioEdicao(produto) {
    if (!adminAtivo) return
    setForm({
      name: produto.name,
      brand: produto.brand,
      image: produto.image,
      badges: (produto.badges || []).join(', '),
      available: produto.available,
      delivery_type: produto.delivery_type,
      duration: produto.duration || '',
      original_price: produto.original_price,
      discount: produto.discount,
      description: produto.description || '',
      features: produto.features || [],
      tagline: produto.tagline || '',
      beneficios: produto.beneficios || [],
      estoque: produto.estoque ?? '',
      passos_ativacao: produto.passos_ativacao || [],
      guia_uso_codigo: produto.guia_uso_codigo || [],
      aviso_prazo: produto.aviso_prazo || '',
      resumo_final: produto.resumo_final || '',
    })
    setProdutoEditando(produto.id)
  }

  function adicionarItem(campo) {
    setForm((f) => ({ ...f, [campo]: [...f[campo], ''] }))
  }

  function atualizarItem(campo, indice, valor) {
    setForm((f) => {
      const novos = [...f[campo]]
      novos[indice] = valor
      return { ...f, [campo]: novos }
    })
  }

  function removerItem(campo, indice) {
    setForm((f) => ({ ...f, [campo]: f[campo].filter((_, i) => i !== indice) }))
  }

  async function salvarProduto(e) {
    e.preventDefault()
    if (!adminAtivo) return
    const originalPrice = parseFloat(form.original_price)
    const discount = parseFloat(form.discount) || 0

    if (!form.name || !form.brand || Number.isNaN(originalPrice)) {
      alert('Preencha nome, marca e um preço válido.')
      return
    }

    const dadosProduto = {
      name: form.name,
      brand: form.brand,
      image: form.image || '🛒',
      badges: form.badges
        ? form.badges.split(',').map((b) => b.trim()).filter(Boolean)
        : [],
      available: form.available,
      delivery_type: form.delivery_type,
      duration: form.duration,
      original_price: originalPrice,
      price: originalPrice - (originalPrice * discount) / 100,
      discount,
      description: form.description,
      features: form.features.map((item) => item.trim()).filter(Boolean),
      tagline: form.tagline,
      beneficios: form.beneficios.map((item) => item.trim()).filter(Boolean),
      estoque: form.estoque === '' ? null : parseInt(form.estoque, 10),
      passos_ativacao: form.passos_ativacao.map((item) => item.trim()).filter(Boolean),
      guia_uso_codigo: form.guia_uso_codigo.map((item) => item.trim()).filter(Boolean),
      aviso_prazo: form.aviso_prazo,
      resumo_final: form.resumo_final,
    }

    setSalvando(true)
    const { error } =
      produtoEditando === 'novo'
        ? await supabase.from('products').insert([dadosProduto])
        : await supabase.from('products').update(dadosProduto).eq('id', produtoEditando)
    setSalvando(false)

    if (error) {
      alert(`Erro ao salvar produto: ${error.message}`)
      return
    }

    setProdutoEditando(null)
    recarregarProdutos()
  }

  async function removerProduto(id) {
    if (!adminAtivo) return
    if (!confirm('Tem certeza que deseja remover este produto?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(`Erro ao remover produto: ${error.message}`)
      return
    }
    recarregarProdutos()
  }

  function comprarAgora(produto) {
    if (!usuario) {
      alert('Você precisa entrar na sua conta para comprar. Clique em "Entrar" no topo da página.')
      return
    }
    setProdutoConfirmando(produto)
  }

  async function iniciarCheckout() {
    const produto = produtoConfirmando
    setProdutoConfirmando(null)
    setComprando(produto.id)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const resposta = await fetch('/api/create-mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: produto.id }),
      })

      const resultado = await resposta.json()

      if (!resposta.ok) {
        throw new Error(resultado.error || 'Não foi possível iniciar o pagamento.')
      }

      window.location.href = resultado.url
    } catch (err) {
      alert(`Não foi possível concluir a compra: ${err.message}`)
      setComprando(null)
    }
  }

  return (
    <section id="produtos" className="secao">
      <div className="secao-cabecalho">
        <h2>Catálogo</h2>
        <p>Todas as assinaturas disponíveis, com desconto já aplicado.</p>
      </div>

      {adminAtivo && (
        <div className="painel-admin">
          <button className="botao-secundario" onClick={() => setPedidosAbertos(true)}>
            Pedidos
          </button>
          <button className="botao-novo" onClick={abrirFormularioNovo}>
            + Novo produto
          </button>
        </div>
      )}

      {pedidosAbertos && <PedidosModal onFechar={() => setPedidosAbertos(false)} />}

      <div className="grade">
        {produtos.map((produto) => {
          const qtdEstoque = estoque[produto.id] || 0
          const semEstoque = qtdEstoque === 0
          const disponivelReal = produto.available && !semEstoque
          const statusTexto = semEstoque ? 'Esgotado' : produto.available ? 'Em estoque' : 'Indisponível'

          return (
            <div className="card" key={produto.id}>
              {produto.badges?.length > 0 && (
                <div className="selos">
                  {produto.badges.map((badge) => (
                    <span className="selo" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <div className="card-topo">
                <span className="icone-marca">{produto.image}</span>
                <div>
                  <h3>{produto.name}</h3>
                  <span className="card-marca">{produto.brand}</span>
                </div>
              </div>

              <span className={`disponibilidade ${disponivelReal ? 'ok' : 'indisponivel'}`}>
                <i />
                {statusTexto}
              </span>

              <div className="precos">
                <div className="precos-linha">
                  {produto.discount > 0 && (
                    <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
                  )}
                  {produto.discount > 0 && (
                    <span className="etiqueta-desconto">-{produto.discount}%</span>
                  )}
                </div>
                <span className="preco-final">{formatarPreco(produto.price)}</span>
              </div>

              <div className="card-acoes">
                <button
                  className="botao-secundario"
                  onClick={() => setProdutoDetalhe({ ...produto, disponivelReal, estoqueReal: qtdEstoque })}
                >
                  Detalhes
                </button>
                <button
                  className="botao-primario"
                  disabled={!disponivelReal || comprando === produto.id}
                  onClick={() => comprarAgora(produto)}
                >
                  {comprando === produto.id ? 'Redirecionando...' : 'Comprar agora'}
                </button>
              </div>

              {adminAtivo && (
                <div className="acoes-admin">
                  <button onClick={() => abrirFormularioEdicao(produto)}>Editar</button>
                  <button onClick={() => setProdutoEstoque(produto)}>Estoque de códigos</button>
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

      <ProductDetailsModal
        produto={produtoDetalhe}
        onFechar={() => setProdutoDetalhe(null)}
        onComprar={comprarAgora}
      />

      {produtoEstoque && (
        <GerenciarEstoqueModal
          produto={produtoEstoque}
          onFechar={() => setProdutoEstoque(null)}
          onEstoqueAlterado={recarregarProdutos}
        />
      )}

      {produtoConfirmando && (
        <div className="overlay" onClick={() => setProdutoConfirmando(null)}>
          <div className="modal-status-pagamento" onClick={(e) => e.stopPropagation()}>
            <h2>Aviso importante</h2>
            <p className="detalhe-texto-livre">
              Após o pagamento, clique em <strong>"Voltar"</strong> na parte de baixo da tela para ver o código da
              sua compra na hora. Se preferir, também enviaremos por e-mail.
            </p>
            <div className="acoes-formulario">
              <button type="button" onClick={() => setProdutoConfirmando(null)}>
                Cancelar
              </button>
              <button type="button" className="botao-primario" onClick={iniciarCheckout}>
                Continuar para pagamento
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
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="🤖" />
            </label>
            <label>
              Nome
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Marca
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
            </label>
            <label>
              Preço original (R$)
              <input
                type="number"
                step="0.01"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                required
              />
            </label>
            <label>
              Desconto (%)
              <input type="number" step="1" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </label>
            <label>
              Duração
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="1 mês" />
            </label>
            <label>
              Tipo de entrega
              <select value={form.delivery_type} onChange={(e) => setForm({ ...form, delivery_type: e.target.value })}>
                <option value="imediata">Imediata</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label>
              Selos (separados por vírgula)
              <input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="Mais vendido, Novo" />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Disponível em estoque
            </label>
            <label>
              Tagline (subtítulo curto)
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Ex: A escolha certa para produtividade" />
            </label>
            <label>
              Estoque disponível
              <input type="number" step="1" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} placeholder="Ex: 15" />
            </label>
            <label>
              Descrição completa
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Escreva os detalhes do produto, pode usar vários parágrafos."
              />
            </label>
            <CampoLista
              label="O que está incluso"
              itens={form.features}
              aoAdicionar={() => adicionarItem('features')}
              aoAtualizar={(indice, valor) => atualizarItem('features', indice, valor)}
              aoRemover={(indice) => removerItem('features', indice)}
              placeholder="Ex: Suporte via WhatsApp"
            />
            <CampoLista
              label="Benefícios (aparecem com check verde)"
              itens={form.beneficios}
              aoAdicionar={() => adicionarItem('beneficios')}
              aoAtualizar={(indice, valor) => atualizarItem('beneficios', indice, valor)}
              aoRemover={(indice) => removerItem('beneficios', indice)}
              placeholder="Ex: Sem anúncios"
            />
            <CampoLista
              label="Passos de ativação"
              itens={form.passos_ativacao}
              aoAdicionar={() => adicionarItem('passos_ativacao')}
              aoAtualizar={(indice, valor) => atualizarItem('passos_ativacao', indice, valor)}
              aoRemover={(indice) => removerItem('passos_ativacao', indice)}
              placeholder="Ex: Acesse o link recebido por e-mail"
            />
            <CampoLista
              label='Passo a passo pós-compra (aparece na tela de "Pagamento aprovado")'
              itens={form.guia_uso_codigo}
              aoAdicionar={() => adicionarItem('guia_uso_codigo')}
              aoAtualizar={(indice, valor) => atualizarItem('guia_uso_codigo', indice, valor)}
              aoRemover={(indice) => removerItem('guia_uso_codigo', indice)}
              placeholder="Ex: Acesse contas.exemplo.com e cole o código no campo Ativação"
            />
            <label>
              Aviso de prazo (opcional)
              <textarea
                rows={2}
                value={form.aviso_prazo}
                onChange={(e) => setForm({ ...form, aviso_prazo: e.target.value })}
                placeholder="Ex: Oferta válida somente até o fim do estoque"
              />
            </label>
            <label>
              Frase resumo final (opcional)
              <input value={form.resumo_final} onChange={(e) => setForm({ ...form, resumo_final: e.target.value })} placeholder="Ex: A forma mais barata de ter o ChatGPT Plus" />
            </label>

            <div className="acoes-formulario">
              <button type="button" onClick={() => setProdutoEditando(null)}>
                Cancelar
              </button>
              <button type="submit" className="botao-primario" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Catalog
