import { useRef, useState } from 'react'

export function HomeCar() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDriving, setIsDriving] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  return (
    <button
      type="button"
      aria-label="首页小车"
      className={`home-car ${isDriving ? 'is-driving' : ''}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onClick={() => {
        setIsDriving(true)
        const playback = audioRef.current?.play()
        playback?.catch(() => {})
      }}
      onPointerDown={(event) => {
        drag.current = { x: event.clientX - position.x, y: event.clientY - position.y }
        const move = (next: PointerEvent) => {
          if (!drag.current || isDriving) {
            return
          }
          setPosition({
            x: next.clientX - drag.current.x,
            y: next.clientY - drag.current.y,
          })
        }
        const up = () => {
          drag.current = null
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }}
    >
      <span className="car-body" />
      <span className="car-top" />
      <span className="car-wheel car-wheel-left" />
      <span className="car-wheel car-wheel-right" />
      <audio ref={audioRef} aria-label="小车音效" src="/assets/car-drive.wav" preload="auto" />
    </button>
  )
}
