import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// Simple test component
function TestButton() {
  return <button>Click me</button>
}

describe('React Testing Library Setup', () => {
  it('should render a component', () => {
    render(<TestButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should find text content', () => {
    render(<TestButton />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should have user-event available', async () => {
    const user = userEvent.setup()
    render(<TestButton />)
    const button = screen.getByRole('button')
    await user.click(button)
    expect(button).toBeInTheDocument()
  })
})
