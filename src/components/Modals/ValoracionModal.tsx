import { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import Modal from '../ui/Modal';
import { valoracionesService } from '../../services/valoraciones';
import { useToast } from '../ui/Toast';

interface Props { intercambioId: number | null; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const ValoracionModal = ({ intercambioId, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [stars, setStars]           = useState(0);
  const [hover, setHover]           = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading]       = useState(false);

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
      <div className="px-2 py-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <button onClick={onClose} className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Ayuda a fortalecer la comunidad
          </h2>
        </div>

        <p className="text-sm text-gray-500 text-center mb-7">
          Califica este servicio y comparte tu experiencia con otros vecinos.
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-7">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star size={38}
                className={`transition-colors ${(hover || stars) >= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <div className="mb-7">
          <label className="text-sm text-gray-500 mb-2 block">Comentario (Opcional)</label>
          <textarea
            className="w-full rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-navy/15 bg-white"
            style={{ boxShadow: 'var(--shadow-ui)' }}
            rows={3}
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            maxLength={500}
            placeholder="Contá tu experiencia..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={onClose} className="btn-outline px-5 py-2.5 text-sm">
            No deseo hacerlo
          </button>
          <button onClick={guardar} disabled={loading} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
