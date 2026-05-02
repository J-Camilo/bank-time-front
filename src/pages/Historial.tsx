import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  SwapOutlined, PlusCircleOutlined, MinusCircleOutlined,
  ClockCircleOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ExclamationCircleOutlined, GiftOutlined,
} from '@ant-design/icons';
import { usuariosService } from '../services/usuarios';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const groupByDate = (movs: any[]) => {
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

const calcPct = (curr: number, prev: number) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

export default function Historial() {
  const { show } = useToast();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<any[]>([]);
  const [creditos, setCreditos]   = useState<any>({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([usuariosService.historial(), usuariosService.creditos()])
      .then(([h, c]) => { setHistorial(h.data); setCreditos(c.data); })
      .catch(() => show('Error al cargar historial', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const movs: any[] = (creditos.movimientos || [])
    .slice()
    .sort((a: any, b: any) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf());

  const thisMonth  = dayjs().month();
  const thisYear   = dayjs().year();
  const prevMonth  = dayjs().subtract(1, 'month').month();
  const prevYear   = dayjs().subtract(1, 'month').year();

  const filterMovs = (tipo: string, month: number, year: number) =>
    movs.filter(m => m.tipo === tipo && dayjs(m.fecha).month() === month && dayjs(m.fecha).year() === year)
        .reduce((a: number, m: any) => a + m.cantidad, 0);

  const ganados        = movs.filter(m => m.tipo === 'GANANCIA').reduce((a, m) => a + m.cantidad, 0);
  const gastados       = movs.filter(m => m.tipo === 'CONSUMO').reduce((a, m) => a + m.cantidad, 0);
  const ganadosMes     = filterMovs('GANANCIA', thisMonth, thisYear);
  const ganadosPrev    = filterMovs('GANANCIA', prevMonth, prevYear);
  const gastadosMes    = filterMovs('CONSUMO',  thisMonth, thisYear);
  const gastadosPrev   = filterMovs('CONSUMO',  prevMonth, prevYear);
  const pctGanados     = calcPct(ganadosMes, ganadosPrev);
  const pctGastados    = calcPct(gastadosMes, gastadosPrev);

  const chartData = Array.from({ length: 15 }, (_, i) => {
    const date = dayjs().subtract(14 - i, 'day');
    const dayMovs = movs.filter(m => dayjs(m.fecha).isSame(date, 'day'));
    return { day: date.format('D'), value: dayMovs.reduce((a, m) => a + m.cantidad, 0) };
  });

  const grouped = groupByDate(movs.slice(0, 30));
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const isToday   = (d: string) => dayjs(d).isSame(dayjs(), 'day');
  const dateLabel = (d: string) => isToday(d) ? 'Hoy' : dayjs(d).format('dddd, D MMMM YYYY');

  const TypeIcon = ({ tipo }: { tipo: string }) => {
    const map: Record<string, { icon: React.ReactNode; bg: string }> = {
      GANANCIA:           { icon: <ArrowUpOutlined />,          bg: '#10B981' },
      CONSUMO:            { icon: <ArrowDownOutlined />,         bg: '#EF4444' },
      PENALIZACION:       { icon: <ExclamationCircleOutlined />, bg: '#F59E0B' },
      ASIGNACION_INICIAL: { icon: <GiftOutlined />,              bg: '#8B5CF6' },
    };
    const { icon, bg } = map[tipo] || { icon: <SwapOutlined />, bg: '#009ADB' };
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-base"
        style={{ background: bg }}>
        {icon}
      </div>
    );
  };

  const StatItem = ({ icon, label, value, pct, up }: any) => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-sky-mid/10 flex items-center justify-center flex-shrink-0 text-sky-mid text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-gray-900">{value}</p>
        {pct !== undefined && (
          <p className={`text-xs font-semibold ${up ? 'text-green-500' : 'text-red-400'}`}>
            {up ? '↑' : '↓'} {Math.abs(pct)}% este mes
          </p>
        )}
      </div>
    </div>
  );

  const ultimoIntercambio = historial.length > 0
    ? dayjs(historial[0].fecha_acordada || historial[0].created_at).format('DD/MM')
    : '–';

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main feed */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Historial</p>
        <p className="text-sm text-gray-500 mb-4 capitalize">01 – 31 {dayjs().format('MMMM, YYYY')}</p>

        {/* Bar chart */}
        <div className="h-24 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={8}>
              <XAxis dataKey="day" hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: any) => [`${v} créditos`, '']}
              />
              <Bar dataKey="value" fill="#009ADB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl mb-3 animate-pulse" />)
        ) : movs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin movimientos de créditos aún</p>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 capitalize">{dateLabel(date)}</h3>
              </div>
              {grouped[date].map((m: any, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <TypeIcon tipo={m.tipo} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.descripcion || 'Movimiento de créditos'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dayjs(m.fecha).format('h:mm a')}</p>
                  </div>
                  <span className={`text-sm font-black flex-shrink-0 ${
                    m.tipo === 'GANANCIA' || m.tipo === 'ASIGNACION_INICIAL' ? 'text-gray-900' : 'text-red-500'
                  }`}>
                    {m.tipo === 'GANANCIA' || m.tipo === 'ASIGNACION_INICIAL' ? '+' : '-'}{m.cantidad}
                  </span>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Right stats */}
      <div className="lg:w-72 lg:border-l border-t lg:border-t-0 border-gray-100 p-4 md:p-5 lg:flex-shrink-0 lg:overflow-y-auto">
        <StatItem icon={<SwapOutlined />}        label="Total de intercambios" value={historial.length} />
        <StatItem icon={<PlusCircleOutlined />}  label="Créditos ganados"      value={ganados}
          pct={pctGanados}  up={pctGanados >= 0} />
        <StatItem icon={<MinusCircleOutlined />} label="Créditos gastados"     value={gastados}
          pct={pctGastados} up={pctGastados <= 0} />
        <StatItem icon={<ClockCircleOutlined />} label="Último intercambio"    value={ultimoIntercambio} />

        {/* CTA */}
        <div className="mt-4 bg-navy rounded-2xl p-5 text-white">
          <p className="font-bold text-sm mb-1">Tus créditos hablan</p>
          <p className="text-xs text-white/60 mb-4">Si deseas tener más créditos, sigue subiendo los servicios que ofreces!</p>
          <button onClick={() => navigate('/inicio')}
            className="w-full bg-white text-navy text-xs font-bold rounded-full py-2.5 hover:bg-gray-100 transition-colors">
            Ir a publicaciones
          </button>
        </div>
      </div>
    </div>
  );
}
