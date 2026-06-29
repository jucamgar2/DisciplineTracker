import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AnnualState from '../components/home/AnnualState';
import { AuthProvider } from '../components/AuthContext';

vi.mock('recharts', () => {
  const Passthrough = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    LineChart: ({ data }) => <div data-testid="line-data">{JSON.stringify(data)}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
  };
});

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('AnnualState', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'token-falso');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita el reporte mensual con el token de autorización', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    renderWithAuth(<AnnualState />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/activities/track/monthly');
    expect(options.method).toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer token-falso');
  });

  it('filtra los meses posteriores al mes actual', async () => {
    const fullYear = MONTHS.map((month, i) => ({ month, tracksCount: i + 1 }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => fullYear }));

    renderWithAuth(<AnnualState />);

    const currentMonth = new Date().getMonth() + 1;
    await waitFor(() => {
      const data = JSON.parse(screen.getByTestId('line-data').textContent);
      expect(data).toHaveLength(currentMonth);
      expect(data.every((d) => MONTHS.indexOf(d.month) + 1 <= currentMonth)).toBe(true);
    });
  });

  it('no realiza la petición si no hay token', async () => {
    localStorage.clear();
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    renderWithAuth(<AnnualState />);

    // Pequeña espera para asegurar que el efecto no dispara la petición.
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
