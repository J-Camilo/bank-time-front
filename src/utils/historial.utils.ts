import dayjs from 'dayjs';

export const calcPct = (curr: number, prev: number): number | null => {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
};

export const groupByDate = (movs: any[]): Record<string, any[]> => {
  const groups: Record<string, any[]> = {};
  movs.forEach(m => {
    const key = dayjs(m.fecha).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  // más reciente primero dentro de cada grupo
  Object.keys(groups).forEach(k =>
    groups[k].sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf())
  );
  return groups;
};
