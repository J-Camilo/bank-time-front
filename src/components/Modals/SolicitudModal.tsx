import { useState, useEffect } from 'react';
import { Clock, Star, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { solicitudesService } from '../../services/solicitudes';
import { publicacionesService } from '../../services/publicaciones';
import { useToast } from '../ui/Toast';
import type { Publicacion } from '../PublicacionCard/PublicacionCard';
import dayjs from 'dayjs';

interface OcupadoSlot { inicio: string; fin: string; }
interface Props { pub: Publicacion | null; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const SolicitudModal = ({ pub, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading]           = useState(false);
  const [fecha, setFecha]               = useState(dayjs().format('YYYY-MM-DD'));
  const [horaSeleccionada, setHora]     = useState<number | null>(null);
  const [horasSol, setHorasSol]         = useState(1);
  const [ocupados, setOcupados]         = useState<OcupadoSlot[]>([]);
  const [loadingDisp, setLoadingDisp]   = useState(false);

  const duracion = pub?.duracion_horas ?? 1;

  useEffect(() => {
    setFecha(dayjs().format('YYYY-MM-DD'));
    setHora(null);
    setHorasSol(1);
    setOcupados([]);
  }, [pub?.id]);

  // Fetch disponibilidad cuando cambia la fecha
  useEffect(() => {
    if (!pub || !fecha) return;
    setLoadingDisp(true);
    publicacionesService.disponibilidad(pub.id, fecha)
      .then(r => setOcupados(r.data.ocupados ?? []))
      .catch(() => setOcupados([]))
      .finally(() => setLoadingDisp(false));
  }, [pub?.id, fecha]);

  // Verifica si una hora de inicio está bloqueada dado el nº de horas solicitadas
  const isBlocked = (startH: number, horas: number): boolean => {
    const ini = dayjs(`${fecha}T${String(startH).padStart(2, '0')}:00:00`);
    const fin = ini.add(horas, 'hour');
    return ocupados.some(o => {
      const oIni = dayjs(o.inicio);
      const oFin = dayjs(o.fin);
      return ini.isBefore(oFin) && fin.isAfter(oIni);
    });
  };

  const maxStartHour = 24 - horasSol;
  const HOURS = Array.from({ length: maxStartHour + 1 }, (_, i) => i);

  const solicitar = async () => {
    if (!pub) return;
    if (horaSeleccionada === null) { show('Elegí un horario disponible', 'error'); return; }

    if (isBlocked(horaSeleccionada, horasSol)) {
      show('Ese horario ya está ocupado. Elegí otro.', 'error'); return;
    }

    setLoading(true);
    try {
      const fechaHora = dayjs(`${fecha}T${String(horaSeleccionada).padStart(2, '0')}:00:00`).toISOString();
      await solicitudesService.crear({
        publicacion_id:  pub.id,
        fecha_propuesta: fechaHora,
        horas_solicitadas: horasSol,
      });
      show('¡Solicitud enviada correctamente!');
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'No se pudo enviar la solicitud', 'error');
    } finally { setLoading(false); }
  };

  if (!pub) return null;

  const horaFin = horaSeleccionada !== null ? horaSeleccionada + horasSol : null;
  const costoTotal = pub.creditos_hora * horasSol;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Info del servicio */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">
            Este servicio caduca {dayjs(pub.fecha_expiracion.substring(0, 10)).format('DD/MM/YYYY')}
          </p>
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{pub.titulo}</h2>
            <span className="text-sm text-gray-400 flex-shrink-0 ml-3">{pub.nombre} {pub.apellido}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {pub.descripcion || 'Sin descripción.'}
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            {pub.creditos_hora} crédito{pub.creditos_hora !== 1 ? 's' : ''} / hora
          </span>
          <span className="text-xs text-gray-400">· Duración máx. {duracion}h</span>
          {pub.promedio_valoracion != null && (pub.total_valoraciones ?? 0) > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              {Number(pub.promedio_valoracion).toFixed(1)}
            </span>
          )}
        </div>

        {/* Selector de horas */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            ¿Cuántas horas necesitás?
          </p>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: duracion }, (_, i) => i + 1).map(h => (
              <button
                key={h}
                onClick={() => { setHorasSol(h); setHora(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  horasSol === h
                    ? 'bg-navy text-white border-navy'
                    : 'border-gray-200 text-gray-600 hover:border-navy/50'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha</p>
          <input
            type="date"
            className="input-field w-full"
            value={fecha}
            onChange={e => { setFecha(e.target.value); setHora(null); }}
            min={dayjs().format('YYYY-MM-DD')}
          />
        </div>

        {/* Horarios disponibles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Horario de inicio</p>
            {loadingDisp && <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>}
          </div>

          {ocupados.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold mb-0.5">Horarios ocupados ese día:</p>
                {ocupados.map((o, i) => (
                  <p key={i}>{dayjs(o.inicio).format('HH:mm')} – {dayjs(o.fin).format('HH:mm')}</p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {HOURS.map(h => {
              const blocked   = isBlocked(h, horasSol);
              const selected  = horaSeleccionada === h;
              const label     = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
              return (
                <button
                  key={h}
                  disabled={blocked}
                  onClick={() => setHora(h)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    blocked   ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed line-through' :
                    selected  ? 'bg-navy text-white border-navy' :
                                'bg-gray-50 text-gray-600 border border-gray-100 hover:border-navy/50 hover:text-navy'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        {horaSeleccionada !== null && (
          <div className="rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3">
            <p className="text-xs font-bold text-sky-700 mb-1">Resumen del servicio</p>
            <p className="text-sm text-sky-800">
              {dayjs(fecha).format('dddd D [de] MMMM')} · {String(horaSeleccionada).padStart(2, '0')}:00 – {String(horaFin).padStart(2, '0')}:00
            </p>
            <p className="text-sm font-black text-sky-900 mt-1">
              Costo: {costoTotal} crédito{costoTotal !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <button
          onClick={solicitar}
          disabled={loading || horaSeleccionada === null}
          className="btn-primary w-full justify-center text-center disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Solicitar'}
        </button>
      </div>
    </Modal>
  );
};
