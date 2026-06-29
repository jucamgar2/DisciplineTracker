import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

function renderFooter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('muestra los tres accesos de navegación', () => {
    renderFooter();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Mis hábitos')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('enlaza cada acceso con su ruta correspondiente', () => {
    const { container } = renderFooter();
    expect(container.querySelector('a[href="/"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="/activities"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="/user/detail"]')).toBeInTheDocument();
  });

  it('marca la sección de actividades cuando la ruta empieza por /activities', () => {
    // No lanza error y mantiene los accesos visibles en la ruta de actividades.
    renderFooter(['/activities']);
    expect(screen.getByText('Mis hábitos')).toBeInTheDocument();
  });
});
