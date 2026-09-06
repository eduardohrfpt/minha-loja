import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconEye, IconEyeOff, IconLock } from './v2icons'

function V2AuthModal({ modoInicial, onFechar }) {
  const { entrar, cadastrar } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState(modoInicial)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const ehLogin = modo === 'login'

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const error = ehLogin ? await entrar(email, senha) : await cadastrar(nome, email, senha)

    setEnviando(false)

    if (error) {
      setErro(error.message)
      return
    }

    if (!ehLogin) {
      alert('Conta criada! Se for solicitada confirmação por e-mail, verifique sua caixa de entrada antes de entrar.')
    }
    onFechar()
    navigate('/v2/catalogo')
  }

  return createPortal(
    <div className="v2-shell v2-overlay" onClick={onFechar}>
      <form className="v2-modal v2-modal--estreito" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <div className="v2-modal-topo">
          <span className="v2-modal-icone">
            <IconLock />
          </span>
          <div>
            <h2>{ehLogin ? 'Bem-vindo de volta' : 'Crie sua conta grátis'}</h2>
            <p className="v2-modal-subtitulo">
              {ehLogin
                ? 'Entre para acessar o catálogo e suas compras.'
                : 'Leva menos de um minuto — e já libera o preço de atacado.'}
            </p>
          </div>
        </div>

        {!ehLogin && (
          <label className="v2-campo">
            <span>Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Como podemos te chamar" />
          </label>
        )}
        <label className="v2-campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@email.com" />
        </label>
        <label className="v2-campo">
          <span>Senha</span>
          <div className="v2-campo-senha">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo de 6 caracteres"
            />
            <button
              type="button"
              className="v2-botao-olho"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </label>

        {erro && <p className="v2-erro-form">{erro}</p>}

        <button type="submit" className="v2-botao v2-botao--ouro v2-botao--bloco v2-botao--grande" disabled={enviando}>
          {enviando ? 'Enviando...' : ehLogin ? 'Entrar' : 'Criar minha conta'}
        </button>
        <button type="button" className="v2-botao v2-botao--fantasma v2-botao--bloco" onClick={onFechar}>
          Cancelar
        </button>

        <button type="button" className="v2-link-alternar" onClick={() => setModo(ehLogin ? 'cadastro' : 'login')}>
          {ehLogin ? 'Ainda não tem conta? Criar conta grátis' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>,
    document.body,
  )
}

export default V2AuthModal
