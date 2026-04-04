type Props = {
  label: string
  onClick: () => void
}

export function VintageAction({ label, onClick }: Props) {
  return (
    <button type="button" className="vintage-action" onClick={onClick}>
      {label}
    </button>
  )
}
