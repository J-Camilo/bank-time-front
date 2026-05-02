import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
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

const EMPTY = {
  titulo: '', creditos: 1, horas: 1, fecha_expiracion: '',
  descripcion: '', ubicacion: '', direccion: '', categoria_id: '',
};

export const PublicacionFormModal = ({ pub, open, onClose, onSuccess }: Props) => {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const isEdit = !!pub;

  const [f, setF] = useState(EMPTY);
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
        fecha_expiracion: pub.fecha_expiracion ? pub.fecha_expiracion.substring(0, 10) : '',
        descripcion:      pub.descripcion || '',
        ubicacion:        pub.municipio || '',
        direccion:        pub.direccion || '',
        categoria_id:     pub.categoria_id ? String(pub.categoria_id) : '',
      });
    } else if (!open) {
      setF(EMPTY);
    }
  }, [pub, open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.categoria_id) { show('Seleccioná una categoría', 'error'); return; }
    setLoading(true);
    try {
      const payload: any = {
        titulo:           f.titulo,
        descripcion:      f.descripcion,
        creditos_hora:    f.creditos,
        fecha_expiracion: f.fecha_expiracion,
        categoria_id:     parseInt(f.categoria_id),
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

  const catOptions = categorias.map(c => ({ value: String(c.id), label: c.nombre }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edición de la publicación' : 'Creación de la publicación'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={save} className="space-y-5">

        {/* Estado automático */}
        <div className="flex items-start gap-3 rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3">
          <span className="text-sky-500 mt-0.5 text-base">ℹ️</span>
          <p className="text-xs text-sky-700 leading-relaxed">
            El estado de la publicación siempre estará <strong>activa</strong> hasta que llegue la fecha de expiración. Este proceso es automático.
          </p>
        </div>

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
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all bg-white"
            style={{ boxShadow: 'var(--shadow-ui)' }}
            value={f.titulo}
            onChange={e => up('titulo', e.target.value)}
            placeholder="Clase de inglés"
            required
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Categoría</label>
          <Select
            value={f.categoria_id}
            onChange={v => up('categoria_id', v)}
            options={catOptions}
            placeholder="Selecciona una categoría"
          />
        </div>

        {/* Créditos · Horas · Fecha */}
        <div className="grid grid-cols-3 gap-3">
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
        </div>

        {/* Descripción */}
        <div>
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
