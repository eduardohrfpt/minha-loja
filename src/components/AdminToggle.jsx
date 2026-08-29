import { IconGear } from './icons'

function AdminToggle({ modoAdmin, setModoAdmin }) {
  return (
    <button
      className={`admin-flutuante ${modoAdmin ? 'ativo' : ''}`}
      onClick={() => setModoAdmin((v) => !v)}
      title={modoAdmin ? 'Sair do modo admin' : 'Entrar no modo admin'}
    >
      <IconGear />
    </button>
  )
}

export default AdminToggle
