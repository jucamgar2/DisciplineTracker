import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleInputBlack from '../components/SimpleInputBlack';

describe('SimpleInputBlack', () => {
  it('renderiza el placeholder', () => {
    render(<SimpleInputBlack placeholder="Nombre" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
  });

  it('muestra el valor recibido', () => {
    render(<SimpleInputBlack placeholder="Nombre" value="Juan" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Juan');
  });

  it('llama onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<SimpleInputBlack placeholder="Nombre" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'a' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('usa type "text" por defecto', () => {
    render(<SimpleInputBlack placeholder="Nombre" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Nombre')).toHaveAttribute('type', 'text');
  });

  it('respeta el type recibido', () => {
    render(<SimpleInputBlack placeholder="Email" type="email" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
  });

  it('muestra el mensaje de error cuando se provee', () => {
    render(<SimpleInputBlack placeholder="Nombre" value="" onChange={() => {}} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('no muestra error cuando no se provee', () => {
    render(<SimpleInputBlack placeholder="Nombre" value="" onChange={() => {}} />);
    expect(screen.queryByText('Campo requerido')).not.toBeInTheDocument();
  });
});
