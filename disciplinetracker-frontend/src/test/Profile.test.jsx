import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../pages/user/Profile';
import { AuthProvider } from '../components/AuthContext';

// AnnualState usa recharts; lo simplificamos para el render en jsdom.
vi.mock('recharts', () => {
  const Passthrough = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    LineChart: () => <div data-testid="line-chart" />,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
  };
});

const today = new Date().toISOString().split('T')[0];

function renderProfile() {
  return render(
    <AuthProvider>
      <Profile />
    </AuthProvider>
  );
}

describe('Profile', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url.includes('/users/detail')) {
          return Promise.resolve({
            json: async () => ({ username: 'ana', name: 'Ana', lastName: 'Pérez' }),
          });
        }
        if (url.includes('/activities/detail')) {
          return Promise.resolve({
            json: async () => [{ id: 1, name: 'Leer', tracks: [today] }],
          });
        }
        // /activities/track/monthly (AnnualState)
        return Promise.resolve({ json: async () => [] });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el nombre de usuario y las iniciales del usuario', async () => {
    renderProfile();
    expect(await screen.findByText('ana')).toBeInTheDocument();
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('calcula la racha del mes a partir de las pistas', async () => {
    renderProfile();
    expect(await screen.findByText('Racha del mes: 1')).toBeInTheDocument();
  });

  it('muestra el botón de cerrar sesión y limpia el token al usarlo', async () => {
    renderProfile();
    const logoutBtn = await screen.findByRole('button', { name: 'Cerrar sesión' });

    fireEvent.click(logoutBtn);

    await waitFor(() => expect(localStorage.getItem('accessToken')).toBeNull());
  });
});
