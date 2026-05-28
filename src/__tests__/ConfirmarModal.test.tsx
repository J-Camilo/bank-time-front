import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmarModal } from '../components/Modals/ConfirmarModal';
import { intercambiosService } from '../services/intercambios';
import { valoracionesService } from '../services/valoraciones';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../services/intercambios', () => ({
  intercambiosService: { confirmar: vi.fn() },
}));

vi.mock('../services/valoraciones', () => ({
  valoracionesService: {
    porIntercambio: vi.fn().mockResolvedValue({ data: [] } as any),
  },
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ show: vi.fn() }),
}));

vi.mock('../components/ui/Modal', () => ({
  default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="modal">{children}</div> : null,
}));

// dayjs funciona sin mock en jsdom (no hace fetch)

// ─── Factory ──────────────────────────────────────────────────────────────────

const makeIntercambio = (overrides = {}) => ({
  id: 42,
  publicacion_titulo: 'Clases de guitarra',
  estado: 'EN_CURSO',
  creditos_acordados: 3,
  prestador_nombre: 'Ana',
  prestador_apellido: 'García',
  receptor_nombre: 'Luis',
  receptor_apellido: 'Martínez',
  confirmacion_prestador: false,
  confirmacion_receptor: false,
  fecha_acordada: '2024-06-15T14:00:00',
  ...overrides,
});

// ─── Tests: modo readonly ─────────────────────────────────────────────────────

describe('ConfirmarModal — modo readonly', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(valoracionesService.porIntercambio).mockResolvedValue({ data: [] } as any);
  });

  it('muestra el título de la publicación', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
        readonly
      />
    );
    expect(screen.getByText('Clases de guitarra')).toBeInTheDocument();
  });

  it('muestra el banner "Ya existe una valoración" en modo readonly', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
        readonly
      />
    );
    expect(
      screen.getByText(/ya existe una valoración/i)
    ).toBeInTheDocument();
  });

  it('muestra las valoraciones cuando las hay', async () => {
    const { valoracionesService } = await import('../services/valoraciones');
    (valoracionesService.porIntercambio as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        {
          id: 1,
          evaluador_nombre: 'Ana',
          evaluador_apellido: 'García',
          evaluado_nombre: 'Luis',
          evaluado_apellido: 'Martínez',
          calificacion: 4,
          comentario: 'Muy buen servicio',
        },
      ],
    } as any);

    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
        readonly
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/muy buen servicio/i)).toBeInTheDocument();
    });
  });

  it('el botón "Cerrar" llama a onClose', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
        readonly
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no muestra el botón "Confirmar participación" en modo readonly', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
        readonly
      />
    );
    expect(
      screen.queryByRole('button', { name: /confirmar participación/i })
    ).not.toBeInTheDocument();
  });
});

// ─── Tests: modo normal ───────────────────────────────────────────────────────

describe('ConfirmarModal — modo normal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el botón "Confirmar participación"', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
      />
    );
    expect(
      screen.getByRole('button', { name: /confirmar participación/i })
    ).toBeInTheDocument();
  });

  it('no muestra el banner de "Ya existe una valoración"', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
      />
    );
    expect(
      screen.queryByText(/ya existe una valoración/i)
    ).not.toBeInTheDocument();
  });

  it('deshabilita el botón de confirmar mientras loading es true', async () => {
    const { intercambiosService } = await import('../services/intercambios');
    // confirmar nunca resuelve durante este test — simula carga infinita
    (intercambiosService.confirmar as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open
        onClose={onClose}
      />
    );

    const btn = screen.getByRole('button', { name: /confirmar participación/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmando/i })).toBeDisabled();
    });
  });

  it('no muestra el modal cuando open=false', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio()}
        open={false}
        onClose={onClose}
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('retorna null si no hay intercambio', () => {
    const { container } = render(
      <ConfirmarModal
        intercambio={null}
        open
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el título del intercambio en modo normal', () => {
    render(
      <ConfirmarModal
        intercambio={makeIntercambio({ publicacion_titulo: 'Clases de yoga' })}
        open
        onClose={onClose}
      />
    );
    expect(screen.getByText('Clases de yoga')).toBeInTheDocument();
  });
});
