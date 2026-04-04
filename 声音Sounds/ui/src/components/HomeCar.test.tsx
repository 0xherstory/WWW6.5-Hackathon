import { fireEvent, render, screen } from '@testing-library/react'
import { HomeCar } from './HomeCar'

describe('HomeCar', () => {
  it('starts driving after click', () => {
    render(<HomeCar />)

    const button = screen.getByRole('button', { name: '首页小车' })
    fireEvent.click(button)

    expect(button).toHaveClass('is-driving')
    expect(screen.getByLabelText('小车音效')).toHaveAttribute('src', '/assets/car-drive.wav')
  })
})
