import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Activities from '../pages/activities/Activities';
import { AuthProvider } from '../components/AuthContext';

function renderWithProviders() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Activities />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Activities', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita las actividades con el token de autorización', async () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });
    renderWithProviders();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/activities');
    expect(options.headers.Authorization).toBe('Bearer token-falso');
  });

  it('renderiza los nombres de las actividades recibidas', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [
        { id: 1, activityName: 'Leer' },
        { id: 2, activityName: 'Correr' },
      ],
    });
    renderWithProviders();

    expect(await screen.findByText('Leer')).toBeInTheDocument();
    expect(screen.getByText('Correr')).toBeInTheDocument();
  });

  it('enlaza cada actividad con su detalle', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [{ id: 5, activityName: 'Meditar' }],
    });
    renderWithProviders();

    const link = await screen.findByRole('link', { name: /Meditar/i });
    expect(link).toHaveAttribute('href', '/activities/5');
  });

  it('muestra el enlace para crear una nueva actividad', async () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });
    const { container } = renderWithProviders();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const newLink = container.querySelector('a[href="/activities/new"]');
    expect(newLink).toBeInTheDocument();
  });

  it('no solicita actividades si no hay token', async () => {
    localStorage.clear();
    fetch.mockResolvedValue({ json: async () => [] });
    renderWithProviders();

    await new Promise((r) => setTimeout(r, 50));
    expect(fetch).not.toHaveBeenCalled();
  });
});
