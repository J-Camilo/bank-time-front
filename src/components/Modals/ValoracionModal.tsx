import { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import Modal from '../ui/Modal';
import { valoracionesService } from '../../services/valoraciones';
import { useToast } from '../ui/Toast';

interface Props { intercambioId: number | null; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const ValoracionModal = ({ intercambioId, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [stars, setStars]       = useState(0);
  const [hover, setHover]       = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading]   = useState(false);

  const guardar = async () => {
    if (!intercambioId || stars === 0) { show('Selecciona una calificación', 'error'); return; }
    setLoading(true);
    try {
      await valoracionesService.crear(intercambioId, stars, comentario);
      show('¡Valoración enviada!');
      setStars(0); setComentario('');
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'No se pudo enviar', 'error');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <h2 className="text-xl font-black text-gray-900">Ayuda a fortalecer la comunidad</h2>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Califica este servicio y comparte tu experiencia con otros vecinos.
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              className="transition-transform hover:scale-110"
            >
              <Star size={36}
                className={`transition-colors ${(hover || stars) >= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
              />
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-2 block">Comentario (Opcional)</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 text-center justify-center">
            No deseo hacerlo
          </button>
          <button onClick={guardar} disabled={loading} className="btn-primary flex-1 text-center justify-center">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
