import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleInputWhite from '../components/SimpleInputWhite';

describe('SimpleInputWhite', () => {
  it('renderiza el placeholder y el valor', () => {
    render(<SimpleInputWhite placeholder="Usuario" value="ana" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Usuario');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('ana');
  });

  it('llama onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<SimpleInputWhite placeholder="Usuario" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'x' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('muestra el mensaje de error cuando se provee', () => {
    render(<SimpleInputWhite placeholder="Usuario" value="" onChange={() => {}} error="Obligatorio" />);
    expect(screen.getByText('Obligatorio')).toBeInTheDocument();
  });
});
