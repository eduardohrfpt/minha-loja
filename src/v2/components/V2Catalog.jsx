import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatarPreco } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import IconeProduto from '../../components/IconeProduto'
import GerenciarEstoqueModal from '../../components/GerenciarEstoqueModal'
import PedidosModal from '../../components/PedidosModal'
import V2ProductDetailsModal from './V2ProductDetailsModal'
import { IconSearch, IconShield } from './v2icons'

// O formulário de cadastro/edição de produto e os modais de estoque/pedidos abaixo são a MESMA
// ferramenta administrativa da versão atual (mesmos campos, mesma lógica, mesmas classes CSS
// antigas) -- só reaproveitados aqui, sem duplicar como um "admin novo". A única coisa nova
// nesta página é a vitrine voltada pro cliente (busca + grade de produtos + modal de detalhes).
const formVazio = {
  name: '',
  brand: '',
  image: '✨',
  image_url: '',
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
  instrucoes_ativacao: '',
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

function V2Catalog({
  produtos,
  estoque,
  recarregarProdutos,
  modoAdmin,
  lojaAberta = true,
  mensagemLojaFechada,
  recarregarConfiguracaoLoja,
}) {
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
  const [busca, setBusca] = useState('')

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return produtos
    return produtos.filter((produto) => produto.name.toLowerCase().includes(termo))
  }, [produtos, busca])

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
      image_url: produto.image_url || '',
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
      instrucoes_ativacao: produto.instrucoes_ativacao || '',
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
      image_url: form.image_url.trim() || null,
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
      instrucoes_ativacao: form.instrucoes_ativacao,
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
    if (!lojaAberta) {
      alert(mensagemLojaFechada || 'Fora do horário de atendimento.')
      return
    }
    setProdutoConfirmando(produto)
  }

  async function alternarLojaAberta() {
    if (!adminAtivo) return
    const { error } = await supabase.from('configuracoes_loja').update({ aberta: !lojaAberta }).eq('id', 1)
    if (error) {
      alert(`Erro ao atualizar horário de funcionamento: ${error.message}`)
      return
    }
    recarregarConfiguracaoLoja?.()
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
    <section id="produtos" className="v2-secao v2-catalogo">
      <div className="v2-container">
        <div className="v2-secao-cabecalho">
          <span className="v2-eyebrow">Catálogo</span>
          <h2>Escolha sua próxima assinatura</h2>
          <p>Todo o desconto já vem aplicado no preço — sem cupom, sem pegadinha.</p>
        </div>

        {!lojaAberta && <div className="v2-aviso-loja-fechada">{mensagemLojaFechada}</div>}

        <div className="v2-busca-catalogo">
          <IconSearch className="v2-busca-catalogo-icone" />
          <input
            type="search"
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {adminAtivo && (
          <div className="painel-admin">
            <button
              className={`botao-secundario botao-loja-status ${lojaAberta ? 'aberta' : 'fechada'}`}
              onClick={alternarLojaAberta}
            >
              Loja: {lojaAberta ? 'Aberta' : 'Fechada'}
            </button>
            <button className="botao-secundario" onClick={() => setPedidosAbertos(true)}>
              Pedidos
            </button>
            <button className="botao-novo" onClick={abrirFormularioNovo}>
              + Novo produto
            </button>
          </div>
        )}

        {pedidosAbertos && (
          <PedidosModal produtos={produtos} estoque={estoque} onFechar={() => setPedidosAbertos(false)} />
        )}

        <div className="v2-grade">
          {produtosFiltrados.map((produto) => {
            const qtdEstoque = estoque[produto.id] || 0
            const semEstoque = qtdEstoque === 0
            const disponivelReal = produto.available && !semEstoque
            const statusTexto = semEstoque ? 'Esgotado' : produto.available ? 'Em estoque' : 'Indisponível'

            return (
              <div className="v2-card" key={produto.id}>
                {produto.badges?.length > 0 && (
                  <div className="v2-card-selos">
                    {produto.badges.map((badge) => (
                      <span className="v2-selo" key={badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <div className="v2-card-topo">
                  <IconeProduto produto={produto} className="v2-card-icone" />
                  <div className="v2-card-titulo">
                    <h3>{produto.name}</h3>
                    <span className="v2-card-marca">{produto.brand}</span>
                  </div>
                </div>

                <span className={`v2-disponibilidade ${disponivelReal ? 'v2-disponibilidade--ok' : 'v2-disponibilidade--indisponivel'}`}>
                  <i />
                  {statusTexto}
                </span>

                <div className="v2-card-precos">
                  <div className="v2-card-precos-linha">
                    {produto.discount > 0 && <span className="v2-preco-riscado">{formatarPreco(produto.original_price)}</span>}
                    {produto.discount > 0 && <span className="v2-etiqueta-desconto">-{produto.discount}%</span>}
                  </div>
                  <span className="v2-preco-final">{formatarPreco(produto.price)}</span>
                </div>

                <div className="v2-card-acoes">
                  <button
                    className="v2-botao v2-botao--secundario"
                    onClick={() => setProdutoDetalhe({ ...produto, disponivelReal, estoqueReal: qtdEstoque })}
                  >
                    Detalhes
                  </button>
                  <button
                    className="v2-botao v2-botao--ouro"
                    disabled={!disponivelReal || comprando === produto.id || !lojaAberta}
                    onClick={() => comprarAgora(produto)}
                  >
                    {comprando === produto.id ? 'Redirecionando...' : lojaAberta ? 'Comprar agora' : 'Loja fechada'}
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

          {produtos.length === 0 && <p className="v2-vazio">Nenhum produto cadastrado.</p>}
          {produtos.length > 0 && produtosFiltrados.length === 0 && (
            <p className="v2-vazio">Nenhum produto encontrado para "{busca}".</p>
          )}
        </div>
      </div>

      <V2ProductDetailsModal produto={produtoDetalhe} onFechar={() => setProdutoDetalhe(null)} onComprar={comprarAgora} />

      {produtoEstoque && (
        <GerenciarEstoqueModal
          produto={produtoEstoque}
          onFechar={() => setProdutoEstoque(null)}
          onEstoqueAlterado={recarregarProdutos}
        />
      )}

      {produtoConfirmando && (
        <div className="v2-shell v2-overlay" onClick={() => setProdutoConfirmando(null)}>
          <div className="v2-modal v2-modal--estreito" onClick={(e) => e.stopPropagation()}>
            <div className="v2-modal-icone" style={{ margin: '0 auto' }}>
              <IconShield />
            </div>
            <h2 style={{ textAlign: 'center' }}>Aviso importante</h2>
            <p className="v2-texto-livre" style={{ textAlign: 'center' }}>
              Após o pagamento, clique em <strong>"Voltar"</strong> na parte de baixo da tela para ver o código da
              sua compra na hora. Se preferir, também enviaremos por e-mail.
            </p>
            <div className="v2-modal-rodape-acoes">
              <button type="button" className="v2-botao v2-botao--fantasma" onClick={() => setProdutoConfirmando(null)}>
                Cancelar
              </button>
              <button type="button" className="v2-botao v2-botao--ouro" onClick={iniciarCheckout}>
                Continuar para pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Painel administrativo -- mesma ferramenta e mesmos campos da versão atual, reaproveitados
          sem alteração de lógica (visual antigo mantido de propósito, pra não duplicar o admin). */}
      {produtoEditando && (
        <div className="overlay" onClick={() => setProdutoEditando(null)}>
          <form className="formulario" onClick={(e) => e.stopPropagation()} onSubmit={salvarProduto}>
            <h2>{produtoEditando === 'novo' ? 'Novo produto' : 'Editar produto'}</h2>

            <label>
              Emoji/ícone
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="🤖" />
            </label>
            <label>
              URL da imagem (opcional, substitui o emoji)
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://i.imgur.com/exemplo.png"
              />
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
            <label>
              Instruções de ativação (passo a passo)
              <textarea
                rows={5}
                value={form.instrucoes_ativacao}
                onChange={(e) => setForm({ ...form, instrucoes_ativacao: e.target.value })}
                placeholder={'Um passo por linha, ex:\nAcesse o link recebido\nFaça login com sua conta\nCole o código no campo de ativação'}
              />
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

export default V2Catalog
