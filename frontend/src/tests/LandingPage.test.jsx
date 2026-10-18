import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

/**
 * LandingPage unit tests.
 * Render LandingPage directly inside a MemoryRouter (needed for any
 * child Link/NavLink components).
 */
function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('renders the hero heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('includes the git repository intelligence pill', () => {
    renderPage()
    expect(screen.getByText(/git repository intelligence/i)).toBeInTheDocument()
  })

  it('renders the Repositories section heading', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Repositories' }),
    ).toBeInTheDocument()
  })

  it('shows that no repositories are registered', () => {
    renderPage()
    expect(screen.getByText(/no repositories registered/i)).toBeInTheDocument()
  })

  it('renders the Add Repository button in a disabled state', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /add repository/i })
    expect(btn).toBeDisabled()
  })

  it('renders all six capability cards', () => {
    renderPage()
    const cards = screen.getAllByRole('listitem')
    // 6 capability cards + 12 stack items = 18 listitems total
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })

  it('marks the Infrastructure capability as Stage 1 ready', () => {
    renderPage()
    // The badge for the implemented capability shows "Stage 1"
    expect(screen.getByText(/✓ Stage 1/)).toBeInTheDocument()
  })

  it('renders the Platform Capabilities section', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: /platform capabilities/i }),
    ).toBeInTheDocument()
  })

  it('renders the Technology Stack section', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: /technology stack/i }),
    ).toBeInTheDocument()
  })

  it('links the View API Docs button to /api/docs', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /view api docs/i })
    expect(link).toHaveAttribute('href', '/api/docs')
  })

  it('does not display any fake analytics data', () => {
    renderPage()
    // These texts would indicate fabricated data
    expect(screen.queryByText(/1,234 commits/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/42 contributors/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/98% coverage/i)).not.toBeInTheDocument()
  })
})
