import { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { solicitudesService } from '../services/solicitudes';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';

export default function SolicitudesRecibidas() {
  const { show } = useToast();
  const [list, setList]             = useState<any[]>([]);
  const [sel, setSel]               = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [acting, setActing]         = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const load = () => {
    setLoading(true);
    solicitudesService.recibidas()
      .then(r => { setList(r.data); if (r.data.length) setSel(r.data[0]); })
      .catch(() => show('Error al cargar', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSelect = (s: any) => {
    setSel(s);
    setShowDetail(true);
  };

  const aceptar = async () => {
    setActing(true);
    try {
      await solicitudesService.aceptar(sel.id);
      show('¡Solicitud aceptada! Se creó un intercambio.');
      setSel(null); setShowDetail(false); load();
    } catch (err: any) { show(err.response?.data?.error || 'Error al aceptar', 'error'); }
    finally { setActing(false); }
  };

  const rechazar = async () => {
    setActing(true);
    try {
      await solicitudesService.rechazar(sel.id);
      show('Solicitud rechazada.');
      setSel(null); setShowDetail(false); load();
    } catch (err: any) { show(err.response?.data?.error || 'Error al rechazar', 'error'); }
    finally { setActing(false); }
  };

  const SolicitudCard = ({ s }: { s: any }) => {
    const active = sel?.id === s.id;
    return (
      <motion.div whileHover={{ scale: 1.01 }} onClick={() => handleSelect(s)}
        className={`p-4 rounded-2xl mb-3 cursor-pointer transition-colors ${
          active ? 'bg-navy text-white' : 'bg-white border border-gray-100 hover:border-navy/20'
        }`}>
        <p className={`text-xs mb-1 ${active ? 'text-white/50' : 'text-gray-400'}`}>
          Fecha propuesta {dayjs(s.fecha_propuesta || s.fecha_solicitud).format('DD/MM/YYYY')}
        </p>
        <h3 className={`font-bold text-base leading-snug mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>
          {s.publicacion_titulo}
        </h3>
        <span className={`flex items-center gap-1 text-xs ${active ? 'text-white/60' : 'text-gray-400'}`}>
          <Clock size={11} /> 1 hora
        </span>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left */}
      <div className={`md:w-72 md:border-r border-gray-100 p-4 overflow-y-auto md:flex-shrink-0
        ${showDetail ? 'hidden md:block' : 'block'}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Solicitudes pendientes</p>
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl mb-3 animate-pulse" />)
          : list.length === 0 ? <p className="text-sm text-gray-400 text-center mt-8">Sin solicitudes pendientes</p>
          : list.map(s => <SolicitudCard key={s.id} s={s} />)
        }
      </div>

      {/* Right */}
      <div className={`flex-1 p-5 md:p-8 overflow-y-auto ${!showDetail ? 'hidden md:flex' : 'flex'} flex-col`}>
        {!sel ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecciona una solicitud</p>
          </div>
        ) : (
          <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Mobile back button */}
            <button
              onClick={() => setShowDetail(false)}
              className="md:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Volver a solicitudes
            </button>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">{sel.publicacion_titulo}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 text-justify">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>

            <div className="flex items-center gap-6 mb-4">
              <span className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} /> 1 hora</span>
              {sel.creditos_acordados != null && (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-sky-mid flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{sel.creditos_acordados}</span>
                  </div>
                  Créditos
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fecha y hora propuesta</p>
              <p className="text-sm text-gray-600 mb-2">Fecha que el usuario desea tomar el servicio</p>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold">{dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('DD/MM/YYYY')}</span>
                  <Calendar size={14} className="text-gray-400" />
                </div>
                <button className="text-xs font-semibold text-sky-mid hover:underline">VER DISPONIBILIDAD</button>
              </div>
              <p className="text-sm text-gray-600 mb-2">Hora que el usuario propuso</p>
              <div className="flex items-center gap-2">
                <div className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700">
                  {dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('HH : mm')}
                </div>
                <span className="text-sm text-gray-500">{dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('A')}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre de usuario</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                <User size={13} />
                <span className="uppercase font-semibold">{sel.nombre} {sel.apellido}</span>
                <span className="text-gray-300">|</span>
                <MapPin size={13} />
                <span>MED – CRA 89 #102 B09</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estado de la solicitud</p>
              <p className="text-sm text-gray-700">Pendiente por su aceptación</p>
            </div>

            {sel.estado === 'PENDIENTE' && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={rechazar} disabled={acting} className="btn-outline">Actualizar y devolver</button>
                <button onClick={aceptar} disabled={acting} className="btn-primary">
                  {acting ? 'Procesando...' : 'Aceptar'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
