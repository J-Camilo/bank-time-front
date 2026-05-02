import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import { publicacionesService } from '../../services/publicaciones';
import { solicitudesService } from '../../services/solicitudes';
import { useToast } from '../ui/Toast';
import type { Publicacion } from './PublicacionCard';

interface Props {
  pub: Publicacion | null;
  open: boolean;
  onClose: () => void;
}

const StarRating = ({ value }: { value: number }) => (
  <span className="text-xs text-yellow-400">
    {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
  </span>
);

const MatchModal = ({ pub, open, onClose }: Props) => {
  const { show } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pub && open) {
      publicacionesService.matches(pub.id)
        .then(r => setMatches(r.data))
        .catch(() => setMatches([]));
    }
  }, [pub, open]);

  const solicitar = async (matchPubId: number) => {
    setLoading(true);
    try {
      await solicitudesService.crear({ publicacion_id: matchPubId });
      show('¡Solicitud enviada! El propietario recibirá una notificación.');
      onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'No se pudo enviar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Matches para: ${pub?.titulo ?? ''}`} maxWidth="max-w-[500px]">
      {matches.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No hay publicaciones compatibles en este momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {matches.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-3d flex items-center gap-3 p-3"
            >
              <div className="w-9 h-9 rounded-full bg-sky-mid flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{m.titulo}</p>
                <p className="text-xs text-gray-500">{m.nombre} {m.apellido}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={m.promedio_valoracion || 0} />
                  <span className="text-xs text-sky-mid flex items-center gap-1">
                    <Clock size={10} /> {m.creditos_hora} créditos
                  </span>
                </div>
              </div>
              <button
                onClick={() => solicitar(m.id)}
                disabled={loading}
                className="btn-primary text-xs px-4 py-1.5 flex-shrink-0"
              >
                Solicitar
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default MatchModal;
