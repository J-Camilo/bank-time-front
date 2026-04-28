import { motion } from 'framer-motion';
import { User, Clock, MapPin, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export interface Publicacion {
  id: number; titulo: string; descripcion: string;
  estado: 'ABIERTO' | 'EXPIRADO'; creditos_hora: number;
  fecha_expiracion: string; categoria_nombre?: string;
  nombre?: string; apellido?: string; promedio_valoracion?: number;
  municipio?: string; usuario_id?: number;
}

interface Props {
  pub: Publicacion;
  onClick?: (pub: Publicacion) => void;
  index?: number;
}

const PublicacionCard = ({ pub, onClick, index = 0 }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
    onClick={() => onClick?.(pub)}
    className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer transition-shadow shadow-sm"
    style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
  >
    {/* Credits badge */}
    <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center text-white font-black text-base mb-3">
      {pub.creditos_hora}
    </div>

    {/* Title */}
    <h3 className="text-sm font-bold text-gray-900 leading-snug mb-3 line-clamp-2">
      {pub.titulo}
    </h3>

    {/* Metadata */}
    <div className="space-y-1.5">
      {(pub.nombre || pub.apellido) && (
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{pub.nombre} {pub.apellido}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">1 hora</span>
      </div>
      {pub.municipio && (
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{pub.municipio}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Calendar size={12} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">{dayjs(pub.fecha_expiracion).format('DD/MM/YYYY')}</span>
      </div>
    </div>
  </motion.div>
);

export default PublicacionCard;
