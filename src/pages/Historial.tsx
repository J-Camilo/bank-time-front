import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { usuariosService } from '../services/usuarios';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const CAT_COLORS = ['#009ADB', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];

const groupByDate = (movs: any[]) => {
  const groups: Record<string, any[]> = {};
  movs.forEach(m => {
    const key = dayjs(m.fecha).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return groups;
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

  const movs = creditos.movimientos || [];
  const ganados  = movs.filter((m: any) => m.tipo === 'GANANCIA').reduce((a: number, m: any) => a + m.cantidad, 0);
  const gastados = movs.filter((m: any) => m.tipo === 'CONSUMO').reduce((a: number, m: any) => a + m.cantidad, 0);

  // Chart data: last 30 days
  const chartData = Array.from({ length: 15 }, (_, i) => {
    const date = dayjs().subtract(14 - i, 'day');
    const dayMovs = movs.filter((m: any) => dayjs(m.fecha).isSame(date, 'day'));
    return { day: date.format('D'), value: dayMovs.reduce((a: number, m: any) => a + m.cantidad, 0) };
  });

  const grouped = groupByDate(movs.slice(0, 20));
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const isToday = (dateStr: string) => dayjs(dateStr).isSame(dayjs(), 'day');
  const dateLabel = (dateStr: string) => isToday(dateStr) ? 'Hoy' : dayjs(dateStr).format('dddd, D MMMM YYYY');

  const TypeIcon = ({ tipo, i }: { tipo: string; i: number }) => {
    const color = tipo === 'GANANCIA' || tipo === 'ASIGNACION_INICIAL' ? CAT_COLORS[2] :
                  tipo === 'PENALIZACION' ? CAT_COLORS[3] : CAT_COLORS[i % CAT_COLORS.length];
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
        style={{ background: color }}>
        {tipo === 'GANANCIA' ? '+' : tipo === 'CONSUMO' ? '−' : '!'}
      </div>
    );
  };

  const StatItem = ({ icon, label, value, sub, trend }: any) => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-14 h-14 rounded-full bg-sky-mid/10 flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        {trend && <p className={`text-xs font-semibold ${trend.up ? 'text-green-500' : 'text-red-400'}`}>{trend.text}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Main feed */}
      <div className="flex-1 p-6 overflow-y-auto">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Historial</p>

        {/* Date range */}
        <p className="text-sm text-gray-500 mb-4">01 – 31 {dayjs().format('MMMM, YYYY')}</p>

        {/* Bar chart */}
        <div className="h-24 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={8}>
              <XAxis dataKey="day" hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: any) => [`${v} créditos`, '']}
              />
              <Bar dataKey="value" fill="#009ADB" radius={[4, 4, 0, 0]}
                label={false} />
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
                <button className="text-gray-400">•••</button>
              </div>
              {grouped[date].map((m: any, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <TypeIcon tipo={m.tipo} i={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.descripcion || 'Movimiento de créditos'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {dayjs(m.fecha).format('h:mm a')}
                    </p>
                  </div>
                  <span className={`text-sm font-black ${
                    m.tipo === 'GANANCIA' || m.tipo === 'ASIGNACION_INICIAL' ? 'text-gray-900' : 'text-red-500'
                  }`}>
                    {m.tipo === 'GANANCIA' || m.tipo === 'ASIGNACION_INICIAL' ? '+' : '-'} {m.cantidad}
                  </span>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Right stats */}
      <div className="w-72 border-l border-gray-100 p-5 flex-shrink-0 overflow-y-auto">
        <StatItem icon="🤝" label="Total de intercambios" value={historial.length} />
        <StatItem icon="➕" label="Créditos ganados" value={ganados} trend={{ up: true, text: '↑ 16% este mes' }} />
        <StatItem icon="➖" label="Créditos gastados" value={gastados} trend={{ up: false, text: '↓ 1% este mes' }} />
        <StatItem icon="🤝" label="Último intercambio" value={historial.length > 0 ? historial.length : 0} />

        {/* CTA card */}
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
