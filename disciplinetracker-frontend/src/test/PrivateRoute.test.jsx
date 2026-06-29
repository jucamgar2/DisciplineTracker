import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { AuthProvider } from '../components/AuthContext';

function renderWithRouter() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route
            path="/private"
            element={
              <PrivateRoute>
                <div>Contenido privado</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirige a /login cuando no hay accessToken', () => {
    renderWithRouter();
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido protegido cuando hay accessToken', () => {
    localStorage.setItem('accessToken', 'token-falso');
    renderWithRouter();
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
  });
});
