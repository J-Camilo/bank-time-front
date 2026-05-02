import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import { intercambiosService } from '../../services/intercambios';
import { useToast } from '../ui/Toast';

interface Props { intercambioId: number | null; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const CancelacionModal = ({ intercambioId, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const cancelar = async () => {
    if (!intercambioId) return;
    setLoading(true);
    try {
      const { data } = await intercambiosService.cancelar(intercambioId);
      if (data.aplicoPenalizacion) {
        show(`Intercambio cancelado. Se aplicó penalización de ${data.penalizacion} créditos.`, 'info');
      } else {
        show('Intercambio cancelado.');
      }
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al cancelar', 'error');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <TriangleAlert size={32} className="text-gray-700" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Política de cancelación</h2>
        <p className="text-xs text-gray-400">Lea con detenimiento esta política de cancelación, por favor.</p>

        <div className="text-sm text-gray-600 space-y-1.5 py-2">
          <p>Puedes cancelar sin penalización hasta 3 días antes.</p>
          <p>Si cancelas con menos tiempo, se descontará el 10% de los créditos.</p>
          <p>Después de 3 cancelaciones, tu cuenta se bloqueará por 3 días.</p>
        </div>

        <p className="text-base font-bold text-gray-800 py-2">
          ¿Está seguro que desea cancelar esta publicación?
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 text-center justify-center">
            Descartar
          </button>
          <button onClick={cancelar} disabled={loading} className="btn-primary flex-1 text-center justify-center">
            {loading ? 'Cancelando...' : 'Cancelar publicación'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
