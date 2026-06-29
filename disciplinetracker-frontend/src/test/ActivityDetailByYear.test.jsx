import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ActivityDetailByYear from '../pages/activities/ActivityDetailByYear';
import { AuthProvider } from '../components/AuthContext';

const currentYear = new Date().getFullYear();

function renderByYear() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/activities/7/annual?year=${currentYear}`]}>
        <Routes>
          <Route path="/activities/:id/annual" element={<ActivityDetailByYear />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ActivityDetailByYear', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita las pistas de la actividad por año', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderByYear();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/activities/detail/7');
    expect(url).toContain(`year=${currentYear}`);
    expect(options.headers.Authorization).toBe('Bearer token-falso');
  });

  it('renderiza el nombre de la actividad', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderByYear();
    expect(await screen.findByText('Leer')).toBeInTheDocument();
  });

  it('muestra el número de veces completada en el año', async () => {
    const tracks = [`${currentYear}-01-01`, `${currentYear}-01-02`, `${currentYear}-03-15`];
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks }) });
    renderByYear();

    expect(
      await screen.findByText(`Actividad completada ${tracks.length} veces en el año`)
    ).toBeInTheDocument();
  });

  it('vuelve a pedir datos al cambiar el año seleccionado', async () => {
    fetch.mockResolvedValue({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderByYear();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: String(currentYear - 1) } });

    await waitFor(() => {
      const lastUrl = fetch.mock.calls.at(-1)[0];
      expect(lastUrl).toContain(`year=${currentYear - 1}`);
    });
  });

  it('muestra el enlace al reporte mensual', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    const { container } = renderByYear();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('a[href="/activities/7"]')).toBeInTheDocument();
  });
});
