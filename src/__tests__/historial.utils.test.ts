import { describe, it, expect } from 'vitest';
import { calcPct, groupByDate } from '../utils/historial.utils';

// ─── calcPct ────────────────────────────────────────────────────────────────

describe('calcPct', () => {
  it('devuelve null cuando prev es 0 y curr es 0', () => {
    expect(calcPct(0, 0)).toBeNull();
  });

  it('devuelve null cuando prev es 0 y curr es positivo', () => {
    expect(calcPct(5, 0)).toBeNull();
  });

  it('calcula correctamente una suba del 50%', () => {
    expect(calcPct(3, 2)).toBe(50);
  });

  it('calcula correctamente una baja del 50%', () => {
    expect(calcPct(1, 2)).toBe(-50);
  });

  it('devuelve 0 cuando curr y prev son iguales', () => {
    expect(calcPct(2, 2)).toBe(0);
  });

  it('redondea el resultado al entero más cercano', () => {
    // (10 - 3) / 3 * 100 = 233.33… → 233
    expect(calcPct(10, 3)).toBe(233);
  });

  it('calcula porcentajes negativos con prev negativo', () => {
    // prev = -4, curr = -2 → ((-2 - -4) / -4) * 100 = -50
    expect(calcPct(-2, -4)).toBe(-50);
  });
});

// ─── groupByDate ─────────────────────────────────────────────────────────────

describe('groupByDate', () => {
  const makeMovs = () => [
    { id: 1, fecha: '2024-03-15T10:00:00', tipo: 'GANANCIA', cantidad: 2 },
    { id: 2, fecha: '2024-03-15T08:00:00', tipo: 'CONSUMO',  cantidad: 1 },
    { id: 3, fecha: '2024-03-16T09:00:00', tipo: 'GANANCIA', cantidad: 3 },
    { id: 4, fecha: '2024-03-14T22:00:00', tipo: 'CONSUMO',  cantidad: 5 },
  ];

  it('agrupa movimientos por fecha (YYYY-MM-DD)', () => {
    const result = groupByDate(makeMovs());
    expect(Object.keys(result)).toHaveLength(3);
    expect(result['2024-03-15']).toHaveLength(2);
    expect(result['2024-03-16']).toHaveLength(1);
    expect(result['2024-03-14']).toHaveLength(1);
  });

  it('ordena desc por hora dentro de cada grupo (más reciente primero)', () => {
    const result = groupByDate(makeMovs());
    const group = result['2024-03-15'];
    // id:1 es 10:00, id:2 es 08:00 → el primero debe ser el id 1
    expect(group[0].id).toBe(1);
    expect(group[1].id).toBe(2);
  });

  it('devuelve objeto vacío para array vacío', () => {
    expect(groupByDate([])).toEqual({});
  });

  it('un solo movimiento queda en su propia clave', () => {
    const result = groupByDate([{ id: 99, fecha: '2024-01-01T12:00:00', tipo: 'GANANCIA', cantidad: 1 }]);
    expect(result['2024-01-01']).toHaveLength(1);
    expect(result['2024-01-01'][0].id).toBe(99);
  });

  it('no pierde datos al agrupar', () => {
    const movs = makeMovs();
    const result = groupByDate(movs);
    const total = Object.values(result).reduce((acc, arr) => acc + arr.length, 0);
    expect(total).toBe(movs.length);
  });
});
