import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/user/Register';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe('Register', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza todos los campos del formulario', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
  });

  it('envía los datos y navega a login con éxito', async () => {
    fetch.mockResolvedValueOnce({ status: 200, json: async () => ({}) });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), {
      target: { value: 'ana' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'secreto' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login?success=true')
    );
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/users/new');
    expect(JSON.parse(options.body).username).toBe('ana');
  });

  it('muestra errores de validación devueltos por el servidor', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ errors: [{ field: 'username', message: 'Usuario en uso' }] }),
    });
    renderRegister();

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(await screen.findByText('Usuario en uso')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('muestra un error genérico de servidor cuando no hay errores de campo', async () => {
    fetch.mockResolvedValueOnce({ status: 500, json: async () => ({}) });
    renderRegister();

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(
      await screen.findByText(
        'Estamos teniendo problemas con el servidor, vuelve a intentarlo más adelante'
      )
    ).toBeInTheDocument();
  });
});
