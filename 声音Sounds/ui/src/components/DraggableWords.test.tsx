import { fireEvent, render, screen } from '@testing-library/react'
import { DraggableWords } from './DraggableWords'

describe('DraggableWords', () => {
  it('moves one word after dragging', () => {
    render(
      <DraggableWords
        items={[
          { id: 'sound', text: '声音', x: 0, y: 0 },
          { id: 'site', text: '网站', x: 80, y: 8 },
        ]}
      />,
    )

    const word = screen.getByText('声音')

    fireEvent.pointerDown(word, { clientX: 10, clientY: 10 })
    fireEvent.pointerMove(window, { clientX: 46, clientY: 28 })
    fireEvent.pointerUp(window)

    expect(word).toHaveStyle({ transform: 'translate(36px, 18px)' })
  })
})
