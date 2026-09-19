import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { formatarPreco } from '../utils'
import { useAuth } from '../context/AuthContext'
import ProductDetailsModal from './ProductDetailsModal'
import GerenciarEstoqueModal from './GerenciarEstoqueModal'
import PedidosModal from './PedidosModal'
import IconeProduto from './IconeProduto'
import { IconSearch, IconShield, IconBolt, IconPackage, IconChevronDown } from './icons'
import { useScrollReveal } from '../hooks/useScrollReveal'

// Sutil, e não atrapalha cliques rápidos: whileHover/whileTap são só transform (escala), não
// mudam layout nem atrasam o onClick -- o clique dispara na hora normal do navegador, a
// animação só acompanha visualmente.
const HOVER_BOTAO_CARD = { scale: 1.035 }
const TAP_BOTAO_CARD = { scale: 0.97 }
const TRANSICAO_BOTAO_CARD = { duration: 0.15, ease: 'easeOut' }

// ATENÇÃO -- texto voltado ao cliente: sempre genérico e igual pra todo produto -- nunca varia
// por delivery_type nem detalha o processo real de entrega (mesmo raciocínio do ENTREGA_RESUMO
// de ProductDetailsModal.jsx, que mantém a própria redação "Até 10 min" -- ver aviso lá).
const ENTREGA_RESUMO_CARD = 'Entrega rápida'

// A marca só agrega informação quando NÃO está contida no nome do produto (ex: "Notion Plus"
// já deixa claro que é da Notion; "Assinatura Anual Premium" com marca "Spotify" não deixa,
// então nesse caso vale mostrar a marca). Comparação simples, sem acento/maiúsculas, já cobre
// os casos reais do catálogo.
function marcaRedundante(produto) {
  if (!produto.brand) return true
  const nome = (produto.name || '').toLowerCase()
  const marca = produto.brand.toLowerCase()
  return nome.includes(marca)
}

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
  preco_referencia: '',
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
  o_que_recebe: '',
  ficha_ocultar_garantia: false,
  prazo_entrega_ficha: '',
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

function Catalog({
  produtos,
  estoque,
  recarregarProdutos,
  modoAdmin,
  lojaAberta = true,
  mensagemLojaFechada,
  recarregarConfiguracaoLoja,
  // Só true na página inicial (visitante não logado) -- troca a grade normal (várias linhas)
  // por um carrossel horizontal de uma linha só, com setas. O catálogo completo em /catalogo
  // (usuários logados) sempre usa a grade, independente deste prop.
  carrossel = false,
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
  const carrosselRef = useRef(null)
  const [setaEsquerdaAtiva, setSetaEsquerdaAtiva] = useState(false)
  const [setaDireitaAtiva, setSetaDireitaAtiva] = useState(false)

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return produtos
    return produtos.filter((produto) => produto.name.toLowerCase().includes(termo))
  }, [produtos, busca])

  // Os cards só existem no DOM depois que produtosFiltrados é preenchido (carregamento do
  // Supabase é assíncrono) -- por isso o efeito de scroll reveal depende dele e roda de novo
  // sempre que a lista muda (carrega, filtra pela busca etc.).
  const containerRef = useRef(null)
  useScrollReveal(containerRef, [produtosFiltrados])

  // Habilita/desabilita cada seta do carrossel conforme a posição atual do scroll horizontal
  // -- some com a seta esquerda no início e com a direita no fim, em vez de deixar clicável
  // sem fazer nada.
  function atualizarSetasCarrossel() {
    const el = carrosselRef.current
    if (!el) return
    setSetaEsquerdaAtiva(el.scrollLeft > 4)
    setSetaDireitaAtiva(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    if (!carrossel) return
    atualizarSetasCarrossel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrossel, produtosFiltrados])

  function rolarCarrossel(direcao) {
    const el = carrosselRef.current
    if (!el) return
    // Rola aproximadamente a largura de um card (+ gap) por clique, na direção pedida. A
    // animação em si vem do scroll-behavior:smooth do CSS (ver .grade-carrossel) -- passar
    // behavior:'smooth' aqui pelo JS não é confiável em alguns navegadores.
    const primeiroCard = el.querySelector('.card')
    const distancia = primeiroCard ? primeiroCard.getBoundingClientRect().width + 28 : el.clientWidth * 0.8
    el.scrollBy({ left: direcao * distancia })
  }

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
      preco_referencia: produto.preco_referencia ?? '',
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
      o_que_recebe: produto.o_que_recebe || '',
      ficha_ocultar_garantia: produto.ficha_ocultar_garantia || false,
      prazo_entrega_ficha: produto.prazo_entrega_ficha || '',
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
      // Preço "oficial" da plataforma pra comparação (ex: valor cobrado direto no site da
      // Disney+) -- opcional e independente do desconto acima, que é o da própria HRKeys. Só
      // aparece pro cliente se o admin preencher; nunca inventamos um valor aqui.
      preco_referencia: parseFloat(form.preco_referencia) || null,
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
      o_que_recebe: form.o_que_recebe.trim() || null,
      ficha_ocultar_garantia: form.ficha_ocultar_garantia,
      prazo_entrega_ficha: form.prazo_entrega_ficha.trim() || null,
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

  const cardsRenderizados = produtosFiltrados.map((produto) => {
    // Só produtos de entrega imediata dependem do estoque de codigos_produto -- entrega
    // manual (ver api/mercadopago-webhook.js) não consome nem checa esse estoque, então
    // não faz sentido marcar como "Esgotado" um produto assim só por não ter códigos
    // pré-cadastrados.
    const usaEstoqueDeCodigos = produto.delivery_type !== 'manual'
    const qtdEstoque = estoque[produto.id] || 0
    const semEstoque = usaEstoqueDeCodigos && qtdEstoque === 0
    const disponivelReal = produto.available && !semEstoque
    // Produto de código fixo (imediata) com estoque real: mostra a contagem, em
    // linguagem simples ("3 unidades disponíveis"), em vez de um badge genérico -- ajuda
    // o cliente a decidir na hora. Entrega manual não tem uma contagem real pra mostrar
    // (ver comentário acima), então continua só "Disponível".
    const statusTexto = semEstoque
      ? 'Esgotado'
      : !produto.available
        ? 'Indisponível'
        : usaEstoqueDeCodigos
          ? `${qtdEstoque} ${qtdEstoque === 1 ? 'unidade disponível' : 'unidades disponíveis'}`
          : 'Disponível'

    return (
      <div className="card" key={produto.id} data-reveal>
        <div className="card-topo">
          <div className="card-diagonal-fundo" aria-hidden="true" />

          {produto.badges?.length > 0 && (
            <div className="selos">
              {produto.badges.map((badge) => (
                <span className="selo" key={badge}>
                  {badge}
                </span>
              ))}
            </div>
          )}

          <div className="card-imagem-flutuante">
            <IconeProduto produto={produto} className="card-banner-imagem" />
          </div>
        </div>

        <div className="card-corpo">
          <h3>{produto.name}</h3>

          {/* A marca só aparece quando agrega informação além do nome (ver
              marcaRedundante acima). */}
          {!marcaRedundante(produto) && <span className="card-marca">{produto.brand}</span>}

          <div className="card-meta">
            <div className="card-info-rapida">
              <span className="card-info-item">
                <IconBolt className="card-info-icone" />
                {ENTREGA_RESUMO_CARD}
              </span>
              {produto.duration && (
                <span className="card-info-item">
                  <IconPackage className="card-info-icone" />
                  {produto.duration}
                </span>
              )}
            </div>

            <span className={`disponibilidade ${disponivelReal ? 'ok' : 'indisponivel'}`}>
              <i />
              {statusTexto}
            </span>
          </div>

          {/* Depois da linha de entrega/status -- totalmente dentro da área branca, sem
              sobrepor a imagem (ver .card-imagem-flutuante, que ocupa .card-topo
              inteiro). */}
          <span className="card-preco-selo">{formatarPreco(produto.price)}</span>

          {produto.preco_referencia > 0 && (
            <div className="card-economia">
              <span className="preco-referencia-valor">{formatarPreco(produto.preco_referencia)}</span>
              <span className="preco-referencia-legenda">Você paga bem menos que o preço oficial</span>
            </div>
          )}
          {produto.discount > 0 && (
            <div className="card-desconto-linha">
              <span className="preco-antigo">{formatarPreco(produto.original_price)}</span>
              <span className="etiqueta-desconto">-{produto.discount}%</span>
            </div>
          )}

          <div className="card-acoes">
            <motion.button
              className="botao-secundario"
              whileHover={HOVER_BOTAO_CARD}
              whileTap={TAP_BOTAO_CARD}
              transition={TRANSICAO_BOTAO_CARD}
              onClick={() => setProdutoDetalhe({ ...produto, disponivelReal, estoqueReal: qtdEstoque })}
            >
              Detalhes
            </motion.button>
            <motion.button
              className="botao-primario"
              whileHover={HOVER_BOTAO_CARD}
              whileTap={TAP_BOTAO_CARD}
              transition={TRANSICAO_BOTAO_CARD}
              disabled={!disponivelReal || comprando === produto.id || !lojaAberta}
              onClick={() => comprarAgora(produto)}
            >
              {comprando === produto.id ? 'Redirecionando...' : lojaAberta ? 'Comprar agora' : 'Loja fechada'}
            </motion.button>
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
      </div>
    )
  })

  return (
    <section id="produtos" className="secao" ref={containerRef}>
      <div className="secao-cabecalho" data-reveal>
        <h2>Catálogo de Produtos</h2>
        <p>Todas as assinaturas disponíveis, com desconto já aplicado.</p>
      </div>

      {!lojaAberta && <div className="aviso-loja-fechada">{mensagemLojaFechada}</div>}

      <div className="busca-catalogo">
        <IconSearch className="busca-catalogo-icone" />
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

      {carrossel ? (
        <div className="grade-carrossel-wrapper">
          <button
            type="button"
            className="grade-carrossel-seta grade-carrossel-seta-esquerda"
            onClick={() => rolarCarrossel(-1)}
            disabled={!setaEsquerdaAtiva}
            aria-label="Ver produtos anteriores"
          >
            <IconChevronDown />
          </button>

          <div
            className="grade grade-carrossel"
            ref={carrosselRef}
            onScroll={atualizarSetasCarrossel}
          >
            {cardsRenderizados}

            {produtos.length === 0 && <p className="vazio">Nenhum produto cadastrado.</p>}
            {produtos.length > 0 && produtosFiltrados.length === 0 && (
              <p className="vazio">Nenhum produto encontrado para "{busca}".</p>
            )}
          </div>

          <button
            type="button"
            className="grade-carrossel-seta grade-carrossel-seta-direita"
            onClick={() => rolarCarrossel(1)}
            disabled={!setaDireitaAtiva}
            aria-label="Ver mais produtos"
          >
            <IconChevronDown />
          </button>
        </div>
      ) : (
        <div className="grade">
          {cardsRenderizados}

          {produtos.length === 0 && <p className="vazio">Nenhum produto cadastrado.</p>}
          {produtos.length > 0 && produtosFiltrados.length === 0 && (
            <p className="vazio">Nenhum produto encontrado para "{busca}".</p>
          )}
        </div>
      )}

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
            <div className="modal-icone-topo">
              <IconShield />
            </div>
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
              Preço de referência (R$) — opcional
              <input
                type="number"
                step="0.01"
                value={form.preco_referencia}
                onChange={(e) => setForm({ ...form, preco_referencia: e.target.value })}
                placeholder="Ex: preço oficial cobrado direto no site da plataforma"
              />
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
              Descrição completa original (opcional) -- texto integral que você mandou antes de
              resumirmos nos campos acima. Aparece no acordeão "Ver mais informações sobre o
              produto", fechado por padrão, no modal de Detalhes.
              <textarea
                rows={10}
                value={form.resumo_final}
                onChange={(e) => setForm({ ...form, resumo_final: e.target.value })}
                placeholder={
                  'Cole aqui o texto completo original enviado pra esse produto (benefícios, ' +
                  'para quem é indicado, compatibilidade, avisos etc.) -- os campos acima ' +
                  '(O que está incluso, Instruções de ativação...) são o resumo desse texto.'
                }
              />
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
            <label>
              Ficha técnica -- "O que você recebe" (opcional)
              <input
                value={form.o_que_recebe}
                onChange={(e) => setForm({ ...form, o_que_recebe: e.target.value })}
                placeholder="Padrão: Código ou link de ativação, para uso na sua própria conta"
              />
            </label>
            <label>
              Ficha técnica -- "Prazo de entrega" (opcional)
              <input
                value={form.prazo_entrega_ficha}
                onChange={(e) => setForm({ ...form, prazo_entrega_ficha: e.target.value })}
                placeholder="Padrão: Até 10 minutos após a confirmação do pagamento"
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.ficha_ocultar_garantia}
                onChange={(e) => setForm({ ...form, ficha_ocultar_garantia: e.target.checked })}
              />
              Ocultar linha "Garantia" na ficha técnica
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
