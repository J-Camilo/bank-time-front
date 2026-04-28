// src/components/Modals/ConfirmarModal.tsx
import { useState } from 'react';
import { CheckCircle, Clock, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import { intercambiosService } from '../../services/intercambios';
import { useToast } from '../ui/Toast';
import dayjs from 'dayjs';

interface Props { intercambio: any; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const ConfirmarModal = ({ intercambio: i, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    try {
      await intercambiosService.confirmar(i.id);
      show('¡Participación confirmada!');
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al confirmar', 'error');
    } finally { setLoading(false); }
  };

  if (!i) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 text-center">{i.publicacion_titulo}</h2>
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><Clock size={14} /> 1 hora</span>
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-sky-mid text-white text-[9px] flex items-center justify-center font-bold">
              {i.creditos_acordados}
            </div>
            Créditos para – {i.prestador_nombre}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</p>
            <p className="text-sm text-gray-700">MEDELLÍN – CRA 89 #102 B09</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
            <p className="text-sm text-gray-700">{dayjs(i.fecha_acordada).format('DD/MM/YYYY')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hora</p>
            <p className="text-sm text-gray-700">{dayjs(i.fecha_acordada).format('HH : mm')} AM</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirma servicio</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{i.prestador_nombre}</span>
              {i.confirmacion_prestador
                ? <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center"><CheckCircle size={10} className="text-white" /></div>
                : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmación de – Usuario</p>
            <p className="text-sm text-gray-500">{i.confirmacion_receptor ? '✅ Confirmado' : 'ESPERANDO CONFIRMACIÓN'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado de la solicitud</p>
            <p className="text-sm font-semibold text-sky-mid">{i.estado.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Descartar</button>
          <button onClick={confirmar} disabled={loading} className="btn-primary">
            {loading ? 'Confirmando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
