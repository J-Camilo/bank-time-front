import { useState, useEffect } from 'react';
import { Clock, Star } from 'lucide-react';
import Modal from '../ui/Modal';
import { solicitudesService } from '../../services/solicitudes';
import { useToast } from '../ui/Toast';
import type { Publicacion } from '../PublicacionCard/PublicacionCard';
import dayjs from 'dayjs';

interface Props { pub: Publicacion | null; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const SolicitudModal = ({ pub, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha]     = useState(dayjs().format('YYYY-MM-DD'));
  const [hora, setHora]       = useState('');
  const [minuto, setMinuto]   = useState('');
  const [ampm, setAmpm]       = useState('AM');

  useEffect(() => {
    setFecha(dayjs().format('YYYY-MM-DD'));
    setHora('');
    setMinuto('');
    setAmpm('AM');
  }, [pub?.id]);

  const solicitar = async () => {
    if (!pub) return;
    setLoading(true);
    try {
      let h24 = parseInt(hora);
      if (ampm === 'PM' && h24 !== 12) h24 += 12;
      if (ampm === 'AM' && h24 === 12) h24 = 0;
      const fechaHora = hora ? dayjs(`${fecha}T${String(h24).padStart(2, '0')}:${(minuto || '00').padStart(2, '0')}:00`).toISOString() : undefined;
      await solicitudesService.crear({ publicacion_id: pub.id, fecha_propuesta: fechaHora });
      show('¡Solicitud enviada correctamente!');
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'No se pudo enviar la solicitud', 'error');
    } finally { setLoading(false); }
  };

  if (!pub) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Service info */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Este servicio caduca {dayjs(pub.fecha_expiracion.substring(0, 10)).format('DD/MM/YYYY')}</p>
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{pub.titulo}</h2>
            <span className="text-sm text-gray-400 flex-shrink-0 ml-3">{pub.nombre} {pub.apellido}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed text-justify line-clamp-4">
          {pub.descripcion || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
        </p>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-gray-500"><Clock size={14} /> {pub.creditos_hora} {pub.creditos_hora === 1 ? 'hora' : 'horas'}</span>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <div className="w-5 h-5 rounded-full bg-sky-mid flex items-center justify-center">
              <Star size={9} className="text-white fill-white" />
            </div>
            ({pub.creditos_hora}) Créditos
          </span>
        </div>

        {/* Date picker */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha que quieres tomar el servicio</p>
          <div className="flex items-center gap-3">
            <input type="date" className="input-field flex-1" value={fecha}
              onChange={e => setFecha(e.target.value)} min={dayjs().format('YYYY-MM-DD')} />
          </div>
        </div>

        {/* Time picker */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hora en que lo necesitas</p>
          <div className="flex items-center gap-2">
            <input type="text" maxLength={2} placeholder="--" className="input-field w-16 text-center"
              value={hora} onChange={e => setHora(e.target.value.replace(/\D/g, '').slice(0, 2))} />
            <span className="text-gray-400">|</span>
            <input type="text" maxLength={2} placeholder="--" className="input-field w-16 text-center"
              value={minuto} onChange={e => setMinuto(e.target.value.replace(/\D/g, '').slice(0, 2))} />
            <div className="flex gap-1">
              {['AM', 'PM'].map(a => (
                <button key={a} onClick={() => setAmpm(a)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${ampm === a ? 'bg-navy text-white' : 'border border-gray-200 text-gray-500 hover:border-navy'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={solicitar} disabled={loading} className="btn-primary w-full justify-center text-center">
          {loading ? 'Enviando...' : 'Solicitar'}
        </button>
      </div>
    </Modal>
  );
};
