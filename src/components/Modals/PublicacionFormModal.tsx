import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { publicacionesService } from '../../services/publicaciones';
import { categoriasService } from '../../services/categorias';
import { useToast } from '../ui/Toast';
import dayjs from 'dayjs';

interface Props { pub?: any; open: boolean; onClose: () => void; onSuccess?: () => void; }

const SpinInput = ({ label, value, min = 1, max = 99, onChange }: {
  label: string; value: number; min?: number; max?: number; onChange: (v: number) => void;
}) => (
  <div>
    <label className="text-xs font-medium text-gray-400 mb-1.5 block">{label}</label>
    <div className="flex items-center rounded-2xl bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-ui)' }}>
      <input
        type="number" min={min} max={max} value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
        className="flex-1 px-3 py-3 text-sm font-semibold text-center text-gray-800 focus:outline-none bg-transparent w-0"
      />
      <div className="flex flex-col border-l border-gray-100">
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="px-2.5 py-1.5 text-[10px] text-gray-400 hover:bg-gray-50 hover:text-navy transition-colors leading-none">▲</button>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="px-2.5 py-1.5 text-[10px] text-gray-400 hover:bg-gray-50 hover:text-navy transition-colors border-t border-gray-100 leading-none">▼</button>
      </div>
    </div>
  </div>
);

export const PublicacionFormModal = ({ pub, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading]       = useState(false);
  const [_categorias, setCategorias] = useState<any[]>([]);
  const isEdit = !!pub;

  const [f, setF] = useState({
    titulo: '', creditos: 1, horas: 1,
    fecha_expiracion: '', descripcion: '', ubicacion: '', direccion: '', categoria_id: '',
  });
  const up = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    categoriasService.listar().then(r => setCategorias(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (pub && open) {
      setF({
        titulo:           pub.titulo || '',
        creditos:         pub.creditos_hora || 1,
        horas:            1,
        fecha_expiracion: pub.fecha_expiracion ? dayjs(pub.fecha_expiracion).format('YYYY-MM-DD') : '',
        descripcion:      pub.descripcion || '',
        ubicacion:        pub.municipio || '',
        direccion:        pub.direccion || '',
        categoria_id:     pub.categoria_id || '',
      });
    } else if (!open) {
      setF({ titulo: '', creditos: 1, horas: 1, fecha_expiracion: '', descripcion: '', ubicacion: '', direccion: '', categoria_id: '' });
    }
  }, [pub, open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titulo:           f.titulo,
        descripcion:      f.descripcion,
        creditos_hora:    f.creditos,
        fecha_expiracion: dayjs(f.fecha_expiracion).format('YYYY-MM-DD'),
        categoria_id:     f.categoria_id ? parseInt(f.categoria_id) : undefined,
      };
      if (isEdit) {
        await publicacionesService.actualizar(pub.id, payload);
        show('Publicación actualizada');
      } else {
        await publicacionesService.crear(payload);
        show('¡Publicación creada!');
      }
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al guardar', 'error');
    } finally { setLoading(false); }
  };

  const eliminar = async () => {
    if (!pub || !confirm('¿Eliminar esta publicación?')) return;
    try {
      await publicacionesService.eliminar(pub.id);
      show('Publicación eliminada');
      onSuccess?.(); onClose();
    } catch (err: any) {
      show(err.response?.data?.error || 'No se puede eliminar', 'error');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edición de la publicación' : 'Creación de la publicación'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={save} className="space-y-5">

        {/* Título + fecha creación */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-400">Nombre de la publicación</label>
            {isEdit && (
              <span className="text-xs text-gray-400 italic">
                Fecha de creación: {pub?.created_at ? dayjs(pub.created_at).format('DD/MM/YYYY') : ''}
              </span>
            )}
          </div>
          <input
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all"
            style={{ boxShadow: 'var(--shadow-ui)' }}
            value={f.titulo}
            onChange={e => up('titulo', e.target.value)}
            placeholder="Clase de inglés"
            required
          />
        </div>

        {/* Créditos · Horas · Fecha · Estado */}
        <div className="grid grid-cols-4 gap-3">
          <SpinInput label="Créditos" value={f.creditos} max={24} onChange={v => up('creditos', v)} />
          <SpinInput label="Horas propuesta" value={f.horas} onChange={v => up('horas', v)} />

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Fecha de expiración</label>
            <input
              type="date"
              className="w-full rounded-2xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all bg-white"
              style={{ boxShadow: 'var(--shadow-ui)' }}
              value={f.fecha_expiracion}
              onChange={e => up('fecha_expiracion', e.target.value)}
              min={dayjs().format('YYYY-MM-DD')}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Estado</label>
            <div
              className="w-full rounded-2xl py-3 flex items-center justify-center font-bold text-sm text-white tracking-wider"
              style={{ background: 'linear-gradient(135deg, #003B54, #009ADB)', boxShadow: 'var(--shadow-dark)' }}
            >
              ACTIVO
            </div>
          </div>
        </div>

        {/* Descripción + Ubicación */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Descripción de la publicación</label>
            <textarea
              className="w-full rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all bg-white"
              style={{ boxShadow: 'var(--shadow-ui)' }}
              rows={5}
              value={f.descripcion}
              onChange={e => up('descripcion', e.target.value)}
              placeholder="Describe el servicio..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Ubicación</label>
            <div className="space-y-2.5">
              <input
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all bg-white uppercase tracking-wide"
                style={{ boxShadow: 'var(--shadow-ui)' }}
                value={f.ubicacion}
                onChange={e => up('ubicacion', e.target.value)}
                placeholder="MEDELLÍN"
              />
              <input
                className="w-full rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all bg-white"
                style={{ boxShadow: 'var(--shadow-ui)' }}
                value={f.direccion}
                onChange={e => up('direccion', e.target.value)}
                placeholder="CRA 89 #102 B09"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-1">
          {isEdit ? (
            <button type="button" onClick={eliminar} className="btn-outline border-red-300 text-red-400 hover:bg-red-50">
              Eliminar publicación
            </button>
          ) : <div />}
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
