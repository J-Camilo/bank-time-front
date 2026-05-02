import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { usuariosService } from '../services/usuarios';
import { updateUser } from '../store/slices/authSlice';
import { useToast } from '../components/ui/Toast';
import Select from '../components/ui/Select';
import dayjs from 'dayjs';

const DEPS: Record<string, string[]> = {
  Antioquia: ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
  Cundinamarca: ['Bogotá', 'Soacha', 'Zipaquirá'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura'],
  Atlántico: ['Barranquilla', 'Soledad'],
  Bolívar: ['Cartagena', 'Magangué'],
};

const GENEROS = [
  { value: '', label: 'Prefiero no decirlo' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];

export default function Perfil() {
  const dispatch = useDispatch();
  const { show } = useToast();
  const [user, setUser]       = useState<any>(null);
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
    <div className="p-6 md:p-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  const depOptions = Object.keys(DEPS).map(d => ({ value: d, label: d }));
  const munOptions = (DEPS[dep] || []).map(m => ({ value: m, label: m }));

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Configuración del perfil</p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Avatar + name */}
        <div className="flex items-center gap-4 md:gap-5 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-navy flex items-center justify-center text-white text-xl md:text-2xl font-black flex-shrink-0">
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{user?.nombre} {user?.apellido}</h2>
            <p className="text-sm text-gray-400">{user?.correo}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
              <Select
                value={f.genero}
                onChange={v => up('genero', v)}
                options={GENEROS}
                placeholder="Prefiero no decirlo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Departamento</label>
              <Select
                value={dep}
                onChange={v => { setDep(v); up('municipio', ''); }}
                options={depOptions}
                placeholder="Selecciona"
              />
            </div>
          </div>

          {/* Municipio + Dirección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Municipio</label>
              <Select
                value={f.municipio}
                onChange={v => up('municipio', v)}
                options={munOptions}
                placeholder={dep ? 'Selecciona' : 'Primero elige departamento'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
              <input
                className="input-field"
                value={f.direccion}
                onChange={e => up('direccion', e.target.value)}
                placeholder="Ingresa tu dirección"
              />
            </div>
          </div>

          {/* Email section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mi email</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-sky-mid/10 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-sky-mid" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.correo}</p>
                <p className="text-xs text-gray-400">
                  {user?.created_at ? `Desde ${dayjs(user.created_at).format('DD/MM/YYYY')}` : ''}
                </p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary px-10">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
