import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

/**
 * App-level smoke tests.
 * Tests run with MemoryRouter so React Router doesn't need a real browser URL.
 */
describe('App', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })

  it('renders the CommitScope logo text on the landing route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    // "CommitScope" appears as two adjacent spans — query flexibly
    const matches = screen.getAllByText(/commit|scope/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders a 404 message for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('shows the main navigation element', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('complementary', { name: /main navigation/i })).toBeInTheDocument()
  })
})
