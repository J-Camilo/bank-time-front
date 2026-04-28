import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { usuariosService } from '../services/usuarios';
import { updateUser } from '../store/slices/authSlice';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';

const DEPS: Record<string, string[]> = {
  Antioquia: ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
  Cundinamarca: ['Bogotá', 'Soacha', 'Zipaquirá'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura'],
  Atlántico: ['Barranquilla', 'Soledad'],
  Bolívar: ['Cartagena', 'Magangué'],
};

export default function Perfil() {
  const dispatch = useDispatch();
  const { show } = useToast();
  const [user, setUser]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [dep, setDep]         = useState('');
  const [f, setF] = useState({ nombre: '', apellido: '', genero: '', municipio: '', direccion: '' });
  const up = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    usuariosService.perfil()
      .then(r => {
        setUser(r.data);
        setDep(r.data.departamento || '');
        setF({ nombre: r.data.nombre, apellido: r.data.apellido, genero: '', municipio: r.data.municipio || '', direccion: r.data.direccion || '' });
      })
      .catch(() => show('Error al cargar perfil', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usuariosService.actualizar({ ...f, departamento: dep });
      dispatch(updateUser(data));
      setUser((p: any) => ({ ...p, ...data }));
      show('Perfil actualizado correctamente');
    } catch { show('Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Configuración del perfil</p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-black">
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.nombre} {user?.apellido}</h2>
            <p className="text-sm text-gray-400">{user?.correo}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input className="input-field" value={f.nombre} onChange={e => up('nombre', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
              <input className="input-field" value={f.apellido} onChange={e => up('apellido', e.target.value)} />
            </div>
          </div>

          {/* Gender + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
              <select className="input-field" value={f.genero} onChange={e => up('genero', e.target.value)}>
                <option value="">Prefiero no decirlo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Departamento</label>
              <select className="input-field" value={dep} onChange={e => { setDep(e.target.value); up('municipio', ''); }}>
                <option value="">Selecciona</option>
                {Object.keys(DEPS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Municipio + Dirección */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Municipio</label>
              <select className="input-field" value={f.municipio} disabled={!dep}
                onChange={e => up('municipio', e.target.value)}>
                <option value="">{dep ? 'Selecciona' : 'Primero elige departamento'}</option>
                {(DEPS[dep] || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
              <select className="input-field" value={f.direccion} onChange={e => up('direccion', e.target.value)}>
                <option value={f.direccion}>{f.direccion || 'Ingresa tu dirección'}</option>
              </select>
            </div>
          </div>

          {/* Email section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mi email</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-sky-mid/10 flex items-center justify-center">
                <Mail size={14} className="text-sky-mid" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.correo}</p>
                <p className="text-xs text-gray-400">
                  {user?.created_at ? dayjs(user.created_at).fromNow() : '1 month ago'}
                </p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="btn-primary px-10">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
