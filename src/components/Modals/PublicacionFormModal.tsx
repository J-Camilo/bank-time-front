import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { publicacionesService } from '../../services/publicaciones';
import { categoriasService } from '../../services/categorias';
import { useToast } from '../ui/Toast';
import dayjs from 'dayjs';

interface Props { pub?: any; open: boolean; onClose: () => void; onSuccess?: () => void; }

export const PublicacionFormModal = ({ pub, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading]     = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const isEdit = !!pub;

  const [f, setF] = useState({
    titulo: '', creditos: 1, horas: 1,
    fecha_expiracion: '', descripcion: '', ubicacion: '', categoria_id: '',
  });
  const up = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    categoriasService.listar().then(r => setCategorias(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (pub && open) {
      setF({
        titulo: pub.titulo || '',
        creditos: pub.creditos_hora || 1,
        horas: 1,
        fecha_expiracion: pub.fecha_expiracion ? dayjs(pub.fecha_expiracion).format('YYYY-MM-DD') : '',
        descripcion: pub.descripcion || '',
        ubicacion: pub.municipio || '',
        categoria_id: pub.categoria_id || '',
      });
    } else if (!open) {
      setF({ titulo: '', creditos: 1, horas: 1, fecha_expiracion: '', descripcion: '', ubicacion: '', categoria_id: '' });
    }
  }, [pub, open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titulo: f.titulo,
        descripcion: f.descripcion,
        creditos_hora: f.creditos,
        fecha_expiracion: dayjs(f.fecha_expiracion).format('YYYY-MM-DD'),
        categoria_id: f.categoria_id ? parseInt(f.categoria_id) : undefined,
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
      maxWidth="max-w-lg"
    >
      <form onSubmit={save} className="space-y-4">
        {/* Top row: title + date */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Nombre de la publicación</label>
            <input className="input-field" value={f.titulo} onChange={e => up('titulo', e.target.value)}
              placeholder="Clase de inglés" required />
          </div>
          {isEdit && (
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-400">Fecha de creación: {pub?.created_at ? dayjs(pub.created_at).format('DD/MM/YYYY') : ''}</p>
            </div>
          )}
        </div>

        {/* Credits + Hours + Date + Status */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Créditos</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <input type="number" min={1} max={24} value={f.creditos}
                onChange={e => up('creditos', parseInt(e.target.value) || 1)}
                className="flex-1 px-3 py-2.5 text-sm text-center focus:outline-none" />
              <div className="flex flex-col border-l border-gray-200">
                <button type="button" onClick={() => up('creditos', Math.min(24, f.creditos + 1))}
                  className="px-2 py-1 text-xs hover:bg-gray-50">▲</button>
                <button type="button" onClick={() => up('creditos', Math.max(1, f.creditos - 1))}
                  className="px-2 py-1 text-xs hover:bg-gray-50 border-t border-gray-200">▼</button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Horas propuesta</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <input type="number" min={1} value={f.horas}
                onChange={e => up('horas', parseInt(e.target.value) || 1)}
                className="flex-1 px-3 py-2.5 text-sm text-center focus:outline-none" />
              <div className="flex flex-col border-l border-gray-200">
                <button type="button" onClick={() => up('horas', f.horas + 1)}
                  className="px-2 py-1 text-xs hover:bg-gray-50">▲</button>
                <button type="button" onClick={() => up('horas', Math.max(1, f.horas - 1))}
                  className="px-2 py-1 text-xs hover:bg-gray-50 border-t border-gray-200">▼</button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fecha de expiración</label>
            <input type="date" className="input-field text-xs" value={f.fecha_expiracion}
              onChange={e => up('fecha_expiracion', e.target.value)}
              min={dayjs().format('YYYY-MM-DD')} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Estado</label>
            <div className="badge-activo inline-flex items-center justify-center py-2.5 px-3 rounded-xl w-full">
              ACTIVO
            </div>
          </div>
        </div>

        {/* Description + Ubicación */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Descripción de la publicación</label>
            <textarea className="input-field resize-none" rows={4} value={f.descripcion}
              onChange={e => up('descripcion', e.target.value)} placeholder="Describe el servicio..." />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ubicación</label>
            <input className="input-field mb-2" value={f.ubicacion}
              onChange={e => up('ubicacion', e.target.value)} placeholder="MEDELLÍN" />
            <input className="input-field" placeholder="CRA B9 #102 B09" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button type="button" onClick={eliminar} className="btn-outline border-red-300 text-red-400 hover:bg-red-50">
              Eliminar publicación
            </button>
          ) : <div />}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
