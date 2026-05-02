import { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { CheckCircleOutlined } from '@ant-design/icons';
import Modal from '../ui/Modal';
import { intercambiosService } from '../../services/intercambios';
import { useToast } from '../ui/Toast';
import dayjs from 'dayjs';

interface Props {
  intercambio: any;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  readonly?: boolean;
}

export const ConfirmarModal = ({ intercambio: i, open, onClose, onSuccess, readonly = false }: Props) => {
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
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">{i.publicacion_titulo}</h2>
          {readonly && (
            <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-0.5">
              <CheckCircleOutlined className="mr-1" />Completado
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {i.creditos_acordados} {i.creditos_acordados === 1 ? 'crédito' : 'créditos'}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-sky-mid text-white text-[9px] flex items-center justify-center font-bold">
              {i.creditos_acordados}
            </div>
            Prestado por {i.prestador_nombre}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
            <p className="text-sm font-semibold text-gray-700">{dayjs(i.fecha_acordada).format('DD/MM/YYYY')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hora</p>
            <p className="text-sm font-semibold text-gray-700">{dayjs(i.fecha_acordada).format('hh:mm A')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prestador</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{i.prestador_nombre} {i.prestador_apellido}</span>
              {i.confirmacion_prestador
                ? <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Receptor</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{i.receptor_nombre} {i.receptor_apellido}</span>
              {i.confirmacion_receptor
                ? <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
            <p className={`text-sm font-semibold ${
              i.estado === 'COMPLETADO' ? 'text-green-600' :
              i.estado === 'EN_CURSO'   ? 'text-sky-mid'   :
              i.estado === 'CANCELADO'  ? 'text-red-500'   : 'text-orange-500'
            }`}>
              {i.estado.replace('_', ' ')}
            </p>
          </div>
        </div>

        {!readonly && (
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="btn-outline">Cancelar</button>
            <button onClick={confirmar} disabled={loading} className="btn-primary">
              {loading ? 'Confirmando...' : 'Confirmar participación'}
            </button>
          </div>
        )}

        {readonly && (
          <div className="flex justify-end">
            <button onClick={onClose} className="btn-outline">Cerrar</button>
          </div>
        )}
      </div>
    </Modal>
  );
};
