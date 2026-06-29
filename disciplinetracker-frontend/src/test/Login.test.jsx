import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/login/Login';
import { AuthProvider } from '../components/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLogin(initialEntries = ['/login']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza los campos de usuario, contraseña y botón', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('muestra el mensaje de éxito cuando ?success está presente', () => {
    renderLogin(['/login?success=true']);
    expect(screen.getByText('Registro completado con exito')).toBeInTheDocument();
  });

  it('no muestra el mensaje de éxito sin el parámetro', () => {
    renderLogin();
    expect(screen.queryByText('Registro completado con exito')).not.toBeInTheDocument();
  });

  it('hace login y navega a "/" cuando las credenciales son válidas', async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ accessToken: 'acc', refreshToken: 'ref' }),
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), {
      target: { value: 'ana' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'secreto' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    expect(localStorage.getItem('accessToken')).toBe('acc');
  });

  it('muestra errores de validación devueltos por el servidor', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({
        errors: [{ field: 'username', message: 'Usuario requerido' }],
      }),
    });

    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Usuario requerido')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('muestra un error de servidor genérico cuando no hay errores de campo', async () => {
    fetch.mockResolvedValueOnce({
      status: 500,
      json: async () => ({}),
    });

    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      await screen.findByText(
        'Estamos teniendo problemas con el servidor, vuelve a intentarlo más adelante'
      )
    ).toBeInTheDocument();
  });
});
