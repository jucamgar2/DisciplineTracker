import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LayoutWithFooter from '../layouts/LayoutWihtFooter';

function renderLayout(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<LayoutWithFooter />}>
          <Route path="/" element={<div>Contenido de la página</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('LayoutWithFooter', () => {
  it('renderiza el contenido de la ruta hija (Outlet)', () => {
    renderLayout();
    expect(screen.getByText('Contenido de la página')).toBeInTheDocument();
  });

  it('renderiza la navegación del footer', () => {
    renderLayout();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Mis hábitos')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });
});
