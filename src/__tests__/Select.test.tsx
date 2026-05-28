import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, { SelectOption } from '../components/ui/Select';

// framer-motion puede causar problemas en jsdom — la mockeamos con identidad
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const OPTIONS: SelectOption[] = [
  { value: 'manzana', label: 'Manzana' },
  { value: 'banana',  label: 'Banana'  },
  { value: 'cereza',  label: 'Cereza'  },
];

const setup = (props: Partial<React.ComponentProps<typeof Select>> = {}) => {
  const onChange = vi.fn();
  const utils = render(
    <Select
      options={OPTIONS}
      value=""
      onChange={onChange}
      {...props}
    />
  );
  return { ...utils, onChange };
};

describe('Select', () => {
  // ── Placeholder ────────────────────────────────────────────────────────────

  it('muestra el placeholder por defecto cuando no hay valor seleccionado', () => {
    setup();
    expect(screen.getByText('Seleccionar')).toBeInTheDocument();
  });

  it('muestra un placeholder personalizado', () => {
    setup({ placeholder: 'Elegí una fruta' });
    expect(screen.getByText('Elegí una fruta')).toBeInTheDocument();
  });

  it('muestra el label de la opción cuando hay un valor seleccionado', () => {
    setup({ value: 'banana' });
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  // ── Abrir / cerrar ─────────────────────────────────────────────────────────

  it('muestra las opciones al hacer click en el trigger', async () => {
    setup();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Manzana')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cereza')).toBeInTheDocument();
    });
  });

  it('no muestra opciones antes de hacer click', () => {
    setup();
    expect(screen.queryByText('Manzana')).not.toBeInTheDocument();
  });

  // ── Selección ──────────────────────────────────────────────────────────────

  it('llama onChange con el valor correcto al seleccionar una opción', async () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByText('Banana'));
    fireEvent.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('cierra el dropdown después de seleccionar', async () => {
    setup();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByText('Manzana'));
    fireEvent.click(screen.getByText('Manzana'));
    await waitFor(() => {
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  // ── Búsqueda ───────────────────────────────────────────────────────────────

  it('muestra el input de búsqueda cuando searchable=true', async () => {
    setup({ searchable: true });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });
  });

  it('filtra las opciones al escribir en el input de búsqueda', async () => {
    const user = userEvent.setup();
    setup({ searchable: true });

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByPlaceholderText('Buscar...'));

    await user.type(screen.getByPlaceholderText('Buscar...'), 'man');

    expect(screen.getByText('Manzana')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Cereza')).not.toBeInTheDocument();
  });

  it('la búsqueda es case-insensitive', async () => {
    const user = userEvent.setup();
    setup({ searchable: true });

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByPlaceholderText('Buscar...'));

    await user.type(screen.getByPlaceholderText('Buscar...'), 'BANA');

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Manzana')).not.toBeInTheDocument();
  });

  it('muestra "Sin resultados" cuando el filtro no tiene matches', async () => {
    const user = userEvent.setup();
    setup({ searchable: true });

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByPlaceholderText('Buscar...'));

    await user.type(screen.getByPlaceholderText('Buscar...'), 'xyz_inexistente');

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('sin searchable no muestra el input de búsqueda aunque esté abierto', async () => {
    setup({ searchable: false });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByText('Manzana'));
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
  });
});
