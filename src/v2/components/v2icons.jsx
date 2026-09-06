// Reexporta o mesmo conjunto de ícones (SVGs) já usado na versão atual -- mesmo traço visual,
// sem duplicar path nenhum -- e acrescenta só os dois que a v2 precisa e a v1 não usa (menu
// hambúrguer e "fechar", pro menu mobile).
export * from '../../components/icons'

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconMenu2(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconX(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconStar(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 14.5 9l6 .8-4.4 4.1 1.1 6L12 17l-5.2 2.9 1.1-6L3.5 9.8l6-.8L12 3.5Z" />
    </svg>
  )
}
