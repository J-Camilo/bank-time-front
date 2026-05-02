import { useEffect, useState } from 'react';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
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
          <Clock size={11} /> {s.promedio_valoracion ? `★ ${Number(s.promedio_valoracion).toFixed(1)}` : 'Sin valoraciones'}
        </span>
      </motion.div>
    );
  };

  const formatHora = (iso: string) => dayjs(iso).format('hh : mm');
  const formatAmpm = (iso: string) => dayjs(iso).format('A');

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left */}
      <div className={`md:w-72 md:border-r border-gray-100 p-4 overflow-y-auto md:flex-shrink-0
        ${showDetail ? 'hidden md:block' : 'block'}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Solicitudes pendientes</p>
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl mb-3 animate-pulse" />)
          : list.length === 0 ? <p className="text-sm text-gray-400 text-center mt-8">Sin solicitudes pendientes</p>
          : list.filter(s => s.estado === 'PENDIENTE').map(s => <SolicitudCard key={s.id} s={s} />)
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

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-tight">{sel.publicacion_titulo}</h1>

            <div className="flex items-center gap-6 mb-6">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} />
                {sel.creditos_acordados != null ? `${sel.creditos_acordados} crédito(s)` : '1 crédito'}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fecha y hora propuesta</p>
              <p className="text-sm text-gray-600 mb-2">Fecha que el usuario desea tomar el servicio</p>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-fit mb-4">
                <span className="text-sm font-semibold">
                  {dayjs(sel.fecha_propuesta || sel.fecha_solicitud).format('DD/MM/YYYY')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Hora que el usuario propuso</p>
              <div className="flex items-center gap-2">
                <div className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700">
                  {formatHora(sel.fecha_propuesta || sel.fecha_solicitud)}
                </div>
                <span className="text-sm text-gray-500">{formatAmpm(sel.fecha_propuesta || sel.fecha_solicitud)}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre de usuario</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User size={13} />
                <span className="uppercase font-semibold">{sel.nombre} {sel.apellido}</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estado de la solicitud</p>
              <p className="text-sm text-gray-700">
                {sel.estado === 'PENDIENTE' ? 'Pendiente por su aceptación' :
                 sel.estado === 'ACEPTADA'  ? <span className="flex items-center gap-1.5 text-green-600"><CheckCircleOutlined /> Solicitud aceptada</span> :
                 sel.estado === 'RECHAZADA' ? <span className="flex items-center gap-1.5 text-red-500"><CloseCircleOutlined /> Solicitud rechazada</span> :
                                              <span className="flex items-center gap-1.5 text-gray-400"><StopOutlined /> Solicitud cancelada</span>}
              </p>
            </div>

            {sel.estado === 'PENDIENTE' && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={rechazar} disabled={acting} className="btn-outline">Rechazar</button>
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
