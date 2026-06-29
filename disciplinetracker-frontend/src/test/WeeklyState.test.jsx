import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeeklyState from '../components/home/WeeklyState';
import { AuthProvider } from '../components/AuthContext';

// Mock de recharts: exponemos los datos del gráfico como JSON para poder
// validar los cálculos sin depender del render real del SVG.
vi.mock('recharts', () => {
  const Passthrough = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    BarChart: ({ data }) => <div data-testid="bar-data">{JSON.stringify(data)}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

const today = new Date().toISOString().split('T')[0];

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('WeeklyState', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza el título del estado semanal', () => {
    renderWithAuth(<WeeklyState monthlyActivities={[]} />);
    expect(screen.getByText('ESTADO SEMANAL')).toBeInTheDocument();
  });

  it('genera datos para los últimos 7 días', async () => {
    renderWithAuth(<WeeklyState monthlyActivities={[]} />);
    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('bar-data').textContent);
      expect(data).toHaveLength(7);
    });
  });

  it('cuenta una actividad realizada hoy en el último día', async () => {
    const monthlyActivities = [{ id: 1, name: 'Leer', tracks: [today] }];
    renderWithAuth(<WeeklyState monthlyActivities={monthlyActivities} />);

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('bar-data').textContent);
      const lastDay = data[data.length - 1];
      expect(lastDay.date).toBe(today);
      expect(lastDay.count).toBe(1);
    });
  });

  it('cuenta 0 cuando no hay pistas en la semana', async () => {
    const monthlyActivities = [{ id: 1, name: 'Leer', tracks: [] }];
    renderWithAuth(<WeeklyState monthlyActivities={monthlyActivities} />);

    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('bar-data').textContent);
      const total = data.reduce((sum, d) => sum + d.count, 0);
      expect(total).toBe(0);
    });
  });
});
