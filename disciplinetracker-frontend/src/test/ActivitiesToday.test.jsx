import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivitiesToday from '../components/home/ActivitiesToday';
import { AuthProvider } from '../components/AuthContext';

const today = new Date().toISOString().split('T')[0];

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('ActivitiesToday', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza los nombres de las actividades del mes', () => {
    const monthlyActivities = [
      { id: 1, name: 'Leer', tracks: [today] },
      { id: 2, name: 'Correr', tracks: [] },
    ];
    renderWithAuth(
      <ActivitiesToday monthlyActivities={monthlyActivities} setMonthlyActivities={() => {}} />
    );
    expect(screen.getByText('Leer')).toBeInTheDocument();
    expect(screen.getByText('Correr')).toBeInTheDocument();
  });

  it('muestra la cabecera con el día actual', () => {
    renderWithAuth(
      <ActivitiesToday monthlyActivities={[]} setMonthlyActivities={() => {}} />
    );
    const day = new Date().getDate();
    expect(screen.getByText(new RegExp(`${day} de`, 'i'))).toBeInTheDocument();
  });

  it('marca como completada la actividad cuya pista incluye hoy', () => {
    const monthlyActivities = [{ id: 1, name: 'Leer', tracks: [today] }];
    const { container } = renderWithAuth(
      <ActivitiesToday monthlyActivities={monthlyActivities} setMonthlyActivities={() => {}} />
    );
    // El estado "completado" renderiza un círculo negro.
    expect(container.querySelector('.bg-black.rounded-full')).toBeInTheDocument();
  });

  it('no marca como completada la actividad sin pista para hoy', () => {
    const monthlyActivities = [{ id: 2, name: 'Correr', tracks: [] }];
    const { container } = renderWithAuth(
      <ActivitiesToday monthlyActivities={monthlyActivities} setMonthlyActivities={() => {}} />
    );
    expect(container.querySelector('.bg-black.rounded-full')).not.toBeInTheDocument();
  });

  it('al pulsar una actividad llama al endpoint de track con el token y la fecha de hoy', async () => {
    fetch.mockResolvedValueOnce({ status: 200, json: async () => ({}) });
    const setMonthlyActivities = vi.fn();
    const monthlyActivities = [{ id: 2, name: 'Correr', tracks: [] }];

    renderWithAuth(
      <ActivitiesToday
        monthlyActivities={monthlyActivities}
        setMonthlyActivities={setMonthlyActivities}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/activities/track/new');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer token-falso');

    const body = JSON.parse(options.body);
    expect(body.tracks[0].activityId).toBe(2);
    expect(body.tracks[0].dates).toContain(today);

    // Tras una respuesta 200 también se actualiza el estado mensual del padre.
    await waitFor(() => expect(setMonthlyActivities).toHaveBeenCalled());
  });

  it('no actualiza el estado del padre cuando el servidor no responde 200', async () => {
    fetch.mockResolvedValueOnce({ status: 500, json: async () => ({}) });
    const setMonthlyActivities = vi.fn();
    const monthlyActivities = [{ id: 2, name: 'Correr', tracks: [] }];

    renderWithAuth(
      <ActivitiesToday
        monthlyActivities={monthlyActivities}
        setMonthlyActivities={setMonthlyActivities}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(setMonthlyActivities).not.toHaveBeenCalled();
  });
});
