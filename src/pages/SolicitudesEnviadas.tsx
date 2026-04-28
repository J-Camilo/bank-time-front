import { useEffect, useState } from 'react';
import { Clock, User, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { solicitudesService } from '../services/solicitudes';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';

export default function SolicitudesEnviadas() {
  const { show } = useToast();
  const [list, setList]       = useState<any[]>([]);
  const [sel, setSel]         = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    solicitudesService.enviadas()
      .then(r => { setList(r.data); if (r.data.length) setSel(r.data[0]); })
      .catch(() => show('Error al cargar solicitudes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const SolicitudCard = ({ s }: { s: any }) => {
    const active = sel?.id === s.id;
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => setSel(s)}
        className={`p-4 rounded-2xl mb-3 cursor-pointer transition-colors ${active ? 'bg-navy text-white' : 'bg-white border border-gray-100 hover:border-navy/20'}`}
      >
        <p className={`text-xs mb-1 ${active ? 'text-white/50' : 'text-gray-400'}`}>
          Este servicio caduca {dayjs(s.fecha_propuesta || s.fecha_solicitud).format('DD/MM/YYYY')}
        </p>
        <h3 className={`font-bold text-base leading-snug mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>
          {s.publicacion_titulo}
        </h3>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 text-xs ${active ? 'text-white/60' : 'text-gray-400'}`}>
            <Clock size={11} /> 1 hora
          </span>
          <span className={`text-xs ${active ? 'text-white/60' : 'text-gray-400'}`}>
            {s.propietario_nombre} {s.propietario_apellido}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Left list */}
      <div className="w-72 border-r border-gray-100 p-4 overflow-y-auto flex-shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mis solicitudes</p>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl mb-3 animate-pulse" />)
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">No has enviado solicitudes aún</p>
        ) : (
          list.map(s => <SolicitudCard key={s.id} s={s} />)
        )}
      </div>

      {/* Right detail */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!sel ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecciona una solicitud</p>
          </div>
        ) : (
          <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-black text-gray-900 mb-4">{sel.publicacion_titulo}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 text-justify">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>

            <div className="flex items-center gap-6 mb-6">
              <span className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} /> 1 hora</span>
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-5 h-5 rounded-full bg-sky-mid flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">2</span>
                </div>
                Créditos
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <MapPin size={13} />
              <span>MED – CRA 89 #102 B09</span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fecha y hora propuesta</p>
              <p className="text-sm text-gray-600 mb-2">Fecha que desearías tomar el servicio</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('DD/MM/YYYY')}
                  </span>
                  <Calendar size={14} className="text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Hora en que lo necesitas</p>
              <div className="flex items-center gap-2">
                <div className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700">
                  {dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('HH : mm')}
                </div>
                <span className="text-sm text-gray-500">AM</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estado de la solicitud</p>
              <p className="text-sm text-gray-700">
                {sel.estado === 'PENDIENTE' ? `Pendiente por aceptación de ${sel.propietario_nombre} ${sel.propietario_apellido}` :
                 sel.estado === 'ACEPTADA'  ? '✅ Solicitud aceptada' : '❌ Solicitud rechazada'}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-outline">Descartar solicitud</button>
              <button className="btn-primary">Guardar cambios</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
