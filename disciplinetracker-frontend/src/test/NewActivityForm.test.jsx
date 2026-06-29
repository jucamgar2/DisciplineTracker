import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewActivityForm from '../pages/activities/NewActivityForm';
import { AuthProvider } from '../components/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <NewActivityForm />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('NewActivityForm', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    mockNavigate.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza el input y los días del mes actual', () => {
    renderForm();
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

    expect(screen.getByPlaceholderText('Nueva actividad')).toBeInTheDocument();
    expect(screen.getByText(String(daysInMonth))).toBeInTheDocument();
  });

  it('marca y desmarca un día al pulsarlo', () => {
    renderForm();
    const day = screen.getByText('1');

    expect(day).not.toHaveClass('bg-black');
    fireEvent.click(day);
    expect(screen.getByText('1')).toHaveClass('bg-black');
    fireEvent.click(screen.getByText('1'));
    expect(screen.getByText('1')).not.toHaveClass('bg-black');
  });

  it('crea la actividad y navega a /activities cuando no hay días seleccionados', async () => {
    fetch.mockResolvedValueOnce({ status: 200, json: async () => ({ id: 10 }) });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('Nueva actividad'), {
      target: { value: 'Leer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar actividad' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/activities'));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/activities/new');
    expect(JSON.parse(options.body)).toEqual({ activityName: 'Leer' });
  });

  it('registra los días seleccionados con una segunda petición de tracks', async () => {
    fetch
      .mockResolvedValueOnce({ status: 200, json: async () => ({ id: 10 }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({}) });
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('Nueva actividad'), {
      target: { value: 'Leer' },
    });
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrar actividad' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const [trackUrl, trackOptions] = fetch.mock.calls[1];
    expect(trackUrl).toContain('/activities/track/new');
    const body = JSON.parse(trackOptions.body);
    expect(body.tracks[0].activityId).toBe(10);
    expect(body.tracks[0].dates).toHaveLength(1);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/activities'));
  });

  it('muestra errores de validación devueltos por el servidor', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ errors: [{ field: 'activityName', message: 'Nombre requerido' }] }),
    });
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Registrar actividad' }));

    expect(await screen.findByText('Nombre requerido')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
