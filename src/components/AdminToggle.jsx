import { IconGear } from './icons'
import { useAuth } from '../context/AuthContext'

function AdminToggle({ modoAdminAtivo, setModoAdminAtivo }) {
  const { isAdmin } = useAuth()

  if (!isAdmin) return null

  return (
    <button
      className={`admin-flutuante ${modoAdminAtivo ? 'ativo' : ''}`}
      onClick={() => setModoAdminAtivo((v) => !v)}
      title={modoAdminAtivo ? 'Sair do modo admin' : 'Entrar no modo admin'}
    >
      <IconGear />
    </button>
  )
}

export default AdminToggle
