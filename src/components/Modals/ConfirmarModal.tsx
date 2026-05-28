import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Star } from 'lucide-react';
import { CheckCircleOutlined } from '@ant-design/icons';
import Modal from '../ui/Modal';
import { intercambiosService } from '../../services/intercambios';
import { valoracionesService } from '../../services/valoraciones';
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
  const [valoraciones, setValoraciones] = useState<any[]>([]);

  useEffect(() => {
    if (open && readonly && i?.id) {
      valoracionesService.porIntercambio(i.id)
        .then(r => setValoraciones(r.data))
        .catch(() => {});
    } else {
      setValoraciones([]);
    }
  }, [open, readonly, i?.id]);

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
          <span className={`inline-block mt-1 text-xs font-semibold rounded-full px-3 py-0.5 ${
            readonly
              ? 'text-green-600 bg-green-50 border border-green-200'
              : 'text-orange-600 bg-orange-50 border border-orange-200'
          }`}>
            <CheckCircleOutlined className="mr-1" />
            {readonly ? 'Completado' : i.estado.replace('_', ' ')}
          </span>
        </div>

        {readonly && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-700 font-medium">
            <CheckCircleOutlined className="text-blue-500 flex-shrink-0" />
            Ya existe una valoración registrada para este intercambio.
          </div>
        )}

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

        {readonly && valoraciones.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valoraciones</p>
            {valoraciones.map((v: any) => (
              <div key={v.id} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {v.evaluador_nombre} {v.evaluador_apellido}
                    <span className="text-gray-400 font-normal"> → </span>
                    {v.evaluado_nombre} {v.evaluado_apellido}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        className={idx < v.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                      />
                    ))}
                  </div>
                </div>
                {v.comentario && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">"{v.comentario}"</p>
                )}
              </div>
            ))}
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
