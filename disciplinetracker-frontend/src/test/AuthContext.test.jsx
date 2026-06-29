import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../components/AuthContext';

// Componente auxiliar para acceder al contexto desde los tests.
function AuthConsumer() {
  const { accessToken, refreshToken, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="access">{accessToken ?? 'none'}</span>
      <span data-testid="refresh">{refreshToken ?? 'none'}</span>
      <button onClick={() => login('access-123', 'refresh-456')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia sin tokens cuando localStorage está vacío', () => {
    renderConsumer();
    expect(screen.getByTestId('access')).toHaveTextContent('none');
    expect(screen.getByTestId('refresh')).toHaveTextContent('none');
  });

  it('login guarda los tokens en el estado y en localStorage', () => {
    renderConsumer();
    act(() => {
      screen.getByText('login').click();
    });
    expect(screen.getByTestId('access')).toHaveTextContent('access-123');
    expect(screen.getByTestId('refresh')).toHaveTextContent('refresh-456');
    expect(localStorage.getItem('accessToken')).toBe('access-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
    expect(localStorage.getItem('tokenIssuedAt')).not.toBeNull();
  });

  it('logout limpia los tokens del estado y de localStorage', () => {
    renderConsumer();
    act(() => {
      screen.getByText('login').click();
    });
    act(() => {
      screen.getByText('logout').click();
    });
    expect(screen.getByTestId('access')).toHaveTextContent('none');
    expect(screen.getByTestId('refresh')).toHaveTextContent('none');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('tokenIssuedAt')).toBeNull();
  });

  it('rehidrata los tokens desde localStorage al montar', () => {
    localStorage.setItem('accessToken', 'persisted-access');
    localStorage.setItem('refreshToken', 'persisted-refresh');
    renderConsumer();
    expect(screen.getByTestId('access')).toHaveTextContent('persisted-access');
    expect(screen.getByTestId('refresh')).toHaveTextContent('persisted-refresh');
  });
});
