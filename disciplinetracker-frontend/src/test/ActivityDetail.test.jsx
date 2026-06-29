import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ActivityDetail from '../pages/activities/ActivityDetail';
import { AuthProvider } from '../components/AuthContext';

const now = new Date();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const yyyy = now.getFullYear();
const firstDay = `${yyyy}-${mm}-01`;

function renderDetail() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/activities/7?month=${now.getMonth() + 1}&year=${yyyy}`]}>
        <Routes>
          <Route path="/activities/:id" element={<ActivityDetail />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ActivityDetail', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita el detalle de la actividad con id, mes y año', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderDetail();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/activities/detail/7');
    expect(url).toContain(`month=${now.getMonth() + 1}`);
    expect(url).toContain(`year=${yyyy}`);
    expect(options.headers.Authorization).toBe('Bearer token-falso');
  });

  it('renderiza el nombre de la actividad', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderDetail();
    expect(await screen.findByText('Leer')).toBeInTheDocument();
  });

  it('marca los días que ya tienen registro', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [firstDay] }) });
    renderDetail();

    const dayButton = await screen.findByRole('button', { name: '01' });
    await waitFor(() => expect(dayButton).toHaveClass('bg-black'));
  });

  it('alterna la selección de un día al pulsarlo', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    renderDetail();

    const dayButton = await screen.findByRole('button', { name: '01' });
    expect(dayButton).not.toHaveClass('bg-black');
    fireEvent.click(dayButton);
    expect(screen.getByRole('button', { name: '01' })).toHaveClass('bg-black');
  });

  it('guarda los registros seleccionados en /activities/track/new', async () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { ...globalThis.location, reload: reloadMock });

    fetch
      .mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({}) });
    renderDetail();

    const dayButton = await screen.findByRole('button', { name: '01' });
    fireEvent.click(dayButton);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const [trackUrl, trackOptions] = fetch.mock.calls[1];
    expect(trackUrl).toContain('/activities/track/new');
    const body = JSON.parse(trackOptions.body);
    expect(body.tracks[0].activityId).toBe('7');
    expect(body.tracks[0].dates).toContain(firstDay);
  });

  it('muestra el enlace al reporte anual', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ name: 'Leer', tracks: [] }) });
    const { container } = renderDetail();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('a[href="/activities/7/annual"]')).toBeInTheDocument();
  });
});
