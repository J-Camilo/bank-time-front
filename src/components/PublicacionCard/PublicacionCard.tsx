import { motion } from 'framer-motion';
import { User, Clock, MapPin, Calendar, Star } from 'lucide-react';
import dayjs from 'dayjs';

export interface Publicacion {
  id: number; titulo: string; descripcion: string;
  estado: 'ABIERTO' | 'EXPIRADO'; creditos_hora: number;
  duracion_horas: number;
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
    whileHover={{ y: -4, scale: 1.01 }}
    onClick={() => onClick?.(pub)}
    className="bg-white rounded-2xl cursor-pointer relative mt-8"
    style={{
      boxShadow: 'var(--shadow-ui)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      padding: '3rem 1.25rem 1.25rem',
    }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-focus)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-ui)')}
  >
    {/* Credits badge — floats above the card */}
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg absolute -top-7 left-5"
      style={{ background: 'linear-gradient(135deg, #003B54, #005f84)', boxShadow: 'var(--shadow-dark)' }}
    >
      {pub.creditos_hora}
    </div>

    {/* Title */}
    <h3 className="text-base font-bold text-gray-900 leading-snug mb-3 line-clamp-2">
      {pub.titulo}
    </h3>

    {/* Divider */}
    <div className="h-px bg-gray-100 mb-3" />

    {/* Metadata */}
    <div className="space-y-2">
      {(pub.nombre || pub.apellido) && (
        <div className="flex items-center gap-2">
          <User size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{pub.nombre} {pub.apellido}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Clock size={13} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">
          {pub.creditos_hora} {pub.creditos_hora === 1 ? 'crédito' : 'créditos'} / hora
        </span>
      </div>
      {pub.promedio_valoracion != null ? (
        <div className="flex items-center gap-2">
          <Star size={13} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
          <span className="text-xs text-gray-500">{Number(pub.promedio_valoracion).toFixed(1)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Star size={13} className="text-gray-200 flex-shrink-0" />
          <span className="text-xs text-gray-300">Sin valoraciones</span>
        </div>
      )}
      {pub.municipio && (
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{pub.municipio}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">{dayjs(pub.fecha_expiracion.substring(0, 10)).format('DD/MM/YYYY')}</span>
      </div>
    </div>
  </motion.div>
);

export default PublicacionCard;
