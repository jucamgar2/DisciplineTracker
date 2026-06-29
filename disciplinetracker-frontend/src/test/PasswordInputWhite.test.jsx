import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from '../components/PasswordInputWhite';

describe('PasswordInputWhite', () => {
  it('renderiza el placeholder', () => {
    render(<PasswordInput placeholder="Contraseña" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
  });

  it('oculta la contraseña por defecto (type password)', () => {
    render(<PasswordInput placeholder="Contraseña" value="secreto" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('alterna la visibilidad al pulsar el botón', () => {
    render(<PasswordInput placeholder="Contraseña" value="secreto" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Contraseña');
    const toggle = screen.getByRole('button');

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('llama onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<PasswordInput placeholder="Contraseña" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'a' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('el botón es de tipo "button" para no enviar el formulario', () => {
    render(<PasswordInput placeholder="Contraseña" value="" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
