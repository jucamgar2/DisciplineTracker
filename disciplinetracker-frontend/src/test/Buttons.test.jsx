import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubmitButtonBlack from '../components/SubmitButtonBlack';
import SubmitButtonWhite from '../components/SubmitButtonWhite';
import LogoAndTitle from '../components/LogoAndTitle';

describe('SubmitButtonBlack', () => {
  it('muestra el texto recibido', () => {
    render(<SubmitButtonBlack text="Enviar" />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('es de tipo submit', () => {
    render(<SubmitButtonBlack text="Enviar" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('SubmitButtonWhite', () => {
  it('muestra el texto recibido', () => {
    render(<SubmitButtonWhite text="Iniciar sesión" />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('es de tipo submit', () => {
    render(<SubmitButtonWhite text="Iniciar sesión" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('LogoAndTitle', () => {
  it('muestra el título de la aplicación', () => {
    render(<LogoAndTitle />);
    expect(screen.getByRole('heading', { name: 'Discipline Tracker' })).toBeInTheDocument();
  });

  it('renderiza el logo', () => {
    render(<LogoAndTitle />);
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', '/Logo-white.png');
  });
});
