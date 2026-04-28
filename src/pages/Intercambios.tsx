import { useEffect, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { intercambiosService } from '../services/intercambios';
import { ConfirmarModal } from '../components/Modals/ConfirmarModal';
import { ValoracionModal } from '../components/Modals/ValoracionModal';
import { CancelacionModal } from '../components/Modals/CancelacionModal';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const HOURS = Array.from({ length: 23 }, (_, i) => i + 1);

const STATUS_STYLE: Record<string, { bg: string; text: string; ribbon: string }> = {
  EN_ESPERA:  { bg: 'bg-white border border-gray-200', text: 'text-gray-900', ribbon: 'bg-orange-400' },
  EN_CURSO:   { bg: 'bg-navy', text: 'text-white',     ribbon: 'bg-sky-mid' },
  COMPLETADO: { bg: 'bg-white border border-gray-200', text: 'text-gray-900', ribbon: 'bg-green-500' },
  CANCELADO:  { bg: 'bg-gray-50 border border-gray-200', text: 'text-gray-400', ribbon: 'bg-gray-400' },
};

export default function Intercambios() {
  const { show } = useToast();
  const [intercambios, setIntercambios] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedDay, setSelectedDay]   = useState(dayjs());
  const [confirmar, setConfirmar]       = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [valoracion, setValoracion]     = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [cancelar, setCancelar]         = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    try { const { data } = await intercambiosService.listar(); setIntercambios(data); }
    catch { show('Error al cargar intercambios', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const dayIntercambios = intercambios.filter(i => dayjs(i.fecha_acordada).isSame(selectedDay, 'day'));

  const IntercambioCard = ({ i }: { i: any }) => {
    const s = STATUS_STYLE[i.estado] || STATUS_STYLE.EN_ESPERA;
    const label = i.estado.replace('_', ' ');
    return (
      <div className={`${s.bg} rounded-2xl p-4 mb-3 relative overflow-hidden`}>
        {/* Ribbon badge */}
        <span className={`absolute top-3 right-3 ${s.ribbon} text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full`}>
          {label}
        </span>
        <p className={`text-xs mb-1.5 ${i.estado === 'EN_CURSO' ? 'text-white/50' : 'text-gray-400'}`}>
          Fecha acordada {dayjs(i.fecha_acordada).format('DD/MM/YYYY')}
        </p>
        <h3 className={`font-bold text-base leading-snug mb-2 pr-16 ${s.text}`}>{i.publicacion_titulo}</h3>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 text-xs ${i.estado === 'EN_CURSO' ? 'text-white/60' : 'text-gray-400'}`}>
            <Clock size={11} /> {i.creditos_acordados} hora{i.creditos_acordados > 1 ? 's' : ''}
          </span>
          {i.estado === 'EN_CURSO' && (
            <button
              onClick={() => setConfirmar({ open: true, item: i })}
              className="w-7 h-7 rounded-full bg-green-400 flex items-center justify-center hover:bg-green-500 transition-colors"
            >
              <Check size={14} className="text-white" />
            </button>
          )}
          {i.estado === 'COMPLETADO' && (
            <button onClick={() => setValoracion({ open: true, id: i.id })}
              className="text-xs text-sky-mid hover:underline font-semibold">
              Ver info
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Left: list */}
      <div className="w-72 border-r border-gray-100 p-4 overflow-y-auto flex-shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Intercambio</p>
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl mb-3 animate-pulse" />)
          : intercambios.length === 0 ? <p className="text-sm text-gray-400 text-center mt-8">Sin intercambios aún</p>
          : intercambios.map(i => <IntercambioCard key={i.id} i={i} />)
        }
      </div>

      {/* Right: day calendar */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {/* Day navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSelectedDay(d => d.subtract(1, 'day'))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium capitalize">{selectedDay.format('dddd')}</p>
            <p className="text-5xl font-black text-gray-900">{selectedDay.format('D')}</p>
          </div>
          <button onClick={() => setSelectedDay(d => d.add(1, 'day'))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {HOURS.map(h => {
              const label = h <= 12 ? `${h} AM` : `${h - 12} PM`;
              const slotIntercambios = dayIntercambios.filter(i => {
                const hour = dayjs(i.fecha_acordada).hour();
                return hour === h;
              });
              return (
                <div key={h} className="flex items-start gap-3 min-h-[52px] border-b border-gray-50 group">
                  <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0 pt-1">{label}</span>
                  <div className="flex-1 relative">
                    {slotIntercambios.map(i => (
                      <motion.div key={i.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0.5 left-0 right-0 bg-sky-mid text-white rounded-lg px-3 py-1.5 text-xs font-semibold z-10"
                      >
                        <p className="font-bold truncate uppercase">{i.publicacion_titulo}</p>
                        <p className="text-white/70">{dayjs(i.fecha_acordada).format('HH:mm')} AM – 10:00 PM</p>
                        <p className="text-white/70">{i.prestador_nombre} {i.prestador_apellido}</p>
                      </motion.div>
                    ))}
                    <div className="h-12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmarModal intercambio={confirmar.item} open={confirmar.open}
        onClose={() => setConfirmar({ open: false, item: null })} onSuccess={load} />
      <ValoracionModal intercambioId={valoracion.id} open={valoracion.open}
        onClose={() => setValoracion({ open: false, id: null })} onSuccess={load} />
      <CancelacionModal intercambioId={cancelar.id} open={cancelar.open}
        onClose={() => setCancelar({ open: false, id: null })} onSuccess={load} />
    </div>
  );
}
