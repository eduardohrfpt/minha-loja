import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconEye, IconEyeOff } from './icons'

function AuthModal({ modoInicial, onFechar }) {
  const { entrar, cadastrar } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState(modoInicial)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const error = modo === 'login' ? await entrar(email, senha) : await cadastrar(nome, email, senha)

    setEnviando(false)

    if (error) {
      setErro(error.message)
      return
    }

    if (modo === 'cadastro') {
      alert('Conta criada! Se for solicitada confirmação por e-mail, verifique sua caixa de entrada antes de entrar.')
    }
    onFechar()
    navigate('/catalogo')
  }

  return createPortal(
    <div className="overlay" onClick={onFechar}>
      <form className="formulario" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2>{modo === 'login' ? 'Entrar' : 'Criar conta'}</h2>

        {modo === 'cadastro' && (
          <label>
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <div className="campo-senha">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="botao-olho"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </label>

        {erro && <p className="erro-form">{erro}</p>}

        <div className="acoes-formulario">
          <button type="button" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao-primario" disabled={enviando}>
            {enviando ? 'Enviando...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <button
          type="button"
          className="link-alternar"
          onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
        >
          {modo === 'login' ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>,
    document.body,
  )
}

export default AuthModal
