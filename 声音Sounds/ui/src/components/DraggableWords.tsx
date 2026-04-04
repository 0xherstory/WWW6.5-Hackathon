import { useMemo, useRef, useState } from 'react'

type WordItem = {
  id: string
  text: string
  x: number
  y: number
  size?: 'title'
}

type Props = {
  items: WordItem[]
}

export function DraggableWords({ items }: Props) {
  const initialPositions = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, { x: item.x, y: item.y }])),
    [items],
  )
  const [positions, setPositions] = useState(initialPositions)
  const dragState = useRef<{ id: string; startX: number; startY: number } | null>(null)

  const handlePointerMove = (event: PointerEvent) => {
    const current = dragState.current
    if (!current) {
      return
    }

    setPositions((prev) => ({
      ...prev,
      [current.id]: {
        x: event.clientX - current.startX,
        y: event.clientY - current.startY,
      },
    }))
  }

  const handlePointerUp = () => {
    dragState.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  return (
    <div className="drag-words" aria-label="首页漂浮文字">
      {items.map((item) => (
        <span
          key={item.id}
          className={`drag-word ${item.size === 'title' ? 'is-title' : ''}`}
          style={{ transform: `translate(${positions[item.id].x}px, ${positions[item.id].y}px)` }}
          onPointerDown={(event) => {
            dragState.current = {
              id: item.id,
              startX: event.clientX - positions[item.id].x,
              startY: event.clientY - positions[item.id].y,
            }
            window.addEventListener('pointermove', handlePointerMove)
            window.addEventListener('pointerup', handlePointerUp)
          }}
        >
          {item.text}
        </span>
      ))}
    </div>
  )
}
