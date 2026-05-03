import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, Handshake, Star } from 'lucide-react';
import { authService } from '../services/auth';
import { useToast } from '../components/ui/Toast';
import Select from '../components/ui/Select';

const DEPS: Record<string, string[]> = {
  Amazonas: ['Leticia', 'Puerto Nariño', 'La Chorrera', 'Tarapacá'],
  Antioquia: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Apartadó', 'Turbo', 'Caucasia', 'Sabaneta', 'La Estrella'],
  Arauca: ['Arauca', 'Saravena', 'Tame', 'Fortul', 'Arauquita'],
  Atlántico: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Galapa', 'Puerto Colombia'],
  Bolívar: ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen de Bolívar', 'Mompox', 'Arjona'],
  Boyacá: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Yopal'],
  Caldas: ['Manizales', 'Villamaría', 'La Dorada', 'Riosucio', 'Chinchiná', 'Anserma'],
  Caquetá: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'La Montañita'],
  Casanare: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'],
  Cauca: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'El Bordo', 'Patía'],
  Cesar: ['Valledupar', 'Aguachica', 'Codazzi', 'Bosconia', 'Curumaní'],
  Chocó: ['Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Riosucio'],
  Córdoba: ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Tierralta', 'Montelíbano'],
  Cundinamarca: ['Bogotá', 'Soacha', 'Zipaquirá', 'Facatativá', 'Chía', 'Fusagasugá', 'Mosquera', 'Madrid', 'Funza', 'Girardot'],
  Guainía: ['Inírida', 'Barranco Minas'],
  Guaviare: ['San José del Guaviare', 'El Retorno', 'Calamar', 'Miraflores'],
  Huila: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar'],
  Magdalena: ['Santa Marta', 'Ciénaga', 'Fundación', 'Plato', 'El Banco'],
  Meta: ['Villavicencio', 'Acacías', 'Granada', 'Cumaral', 'Puerto López'],
  Nariño: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'La Unión'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios'],
  Putumayo: ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Sibundoy'],
  Quindío: ['Armenia', 'Calarcá', 'Montenegro', 'Quimbaya', 'La Tebaida'],
  Risaralda: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  Santander: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'Socorro'],
  Sucre: ['Sincelejo', 'Corozal', 'Sampués', 'San Marcos', 'Tolú'],
  Tolima: ['Ibagué', 'Espinal', 'Honda', 'Melgar', 'Chaparral'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Cartago', 'Yumbo', 'Jamundí'],
  Vaupés: ['Mitú', 'Carurú'],
  Vichada: ['Puerto Carreño', 'La Primavera', 'Santa Rosalía'],
};

const WAVE_NAVY = [
  'M0,0 L110,0 C280,250 -60,750 110,1000 L0,1000 Z',
  'M0,0 L110,0 C-60,250 280,750 110,1000 L0,1000 Z',
  'M0,0 L110,0 C280,250 -60,750 110,1000 L0,1000 Z',
];
const WAVE_WHITE = [
  'M110,0 C280,250 -60,750 110,1000 L220,1000 L220,0 Z',
  'M110,0 C-60,250 280,750 110,1000 L220,1000 L220,0 Z',
  'M110,0 C280,250 -60,750 110,1000 L220,1000 L220,0 Z',
];

export default function Register() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [dep, setDep] = useState('');
  const [f, setF] = useState({
    nombre: '', apellido: '', correo: '', municipio: '',
    direccion: '', contrasena: '', confirmar: '',
  });

  const update = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.contrasena !== f.confirmar) return show('Las contraseñas no coinciden', 'error');
    setLoading(true);
    try {
      const { confirmar, ...rest } = f;
      await authService.register({ ...rest, departamento: dep });
      show('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al registrarse', 'error');
    } finally { setLoading(false); }
  };

  const wave = { duration: 7, repeat: Infinity, ease: 'easeInOut' as const };

  const depOptions = Object.keys(DEPS).map(d => ({ value: d, label: d }));
  const munOptions = (DEPS[dep] || []).map(m => ({ value: m, label: m }));

  const formFields = (
    <div className="space-y-3">
      <input className="input-field" placeholder="Ingrese su nombre"
        value={f.nombre} onChange={e => update('nombre', e.target.value)} required />
      <input className="input-field" placeholder="Ingrese apellido"
        value={f.apellido} onChange={e => update('apellido', e.target.value)} required />
      <input className="input-field" type="email" placeholder="Ingrese correo electrónico"
        value={f.correo} onChange={e => update('correo', e.target.value)} required />

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">Departamento</label>
        <Select
          value={dep}
          onChange={v => { setDep(v); update('municipio', ''); }}
          options={depOptions}
          placeholder="Selecciona el departamento"
          searchable
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">Ciudad</label>
        <Select
          value={f.municipio}
          onChange={v => update('municipio', v)}
          options={munOptions}
          placeholder={dep ? 'Selecciona tu ciudad' : 'Primero elige departamento'}
          searchable
        />
      </div>

      <input className="input-field" placeholder="Ingrese su dirección"
        value={f.direccion} onChange={e => update('direccion', e.target.value)} />
      <input className="input-field" type="password" placeholder="Ingrese su contraseña"
        value={f.contrasena} onChange={e => update('contrasena', e.target.value)} required />
      <input className="input-field" type="password" placeholder="Confirme su contraseña"
        value={f.confirmar} onChange={e => update('confirmar', e.target.value)} required />

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>

      <div className="text-center pt-1">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-navy font-semibold hover:underline">Ingresa aquí</Link>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile layout (< sm) ────────────────────────── */}
      <div className="sm:hidden min-h-screen bg-white flex flex-col">
        <div
          className="bg-navy flex items-end justify-center pb-8 pt-14 flex-shrink-0"
          style={{ borderRadius: '0 0 40px 40px' }}
        >
          <div className="text-center text-white px-6">
            <h1 className="text-4xl font-black tracking-tight">BOTIme.</h1>
            <p className="text-white/60 text-sm mt-1">Banco de tiempo comunitario</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <form onSubmit={submit} className="w-full max-w-sm mx-auto">
            {formFields}
          </form>
        </div>
      </div>

      {/* ── Desktop layout (≥ sm) ────────────────────────── */}
      <div className="hidden sm:flex h-screen bg-white relative overflow-hidden">
        <div className="flex-shrink-0 bg-navy relative flex flex-col justify-between py-14 px-10 overflow-hidden"
          style={{ width: '40%' }}>
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #009ADB, transparent)' }} />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #009ADB, transparent)' }} />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <Landmark size={22} className="text-white" />
            </div>
            <span className="text-white font-black text-2xl tracking-tight">BOTIme.</span>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Unite a la<br />comunidad<br />del tiempo.
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Creá tu cuenta gratis y empezá a intercambiar habilidades con personas cerca tuyo.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { icon: <Handshake size={16} />, text: 'Intercambios sin dinero' },
              { icon: <Star size={16} />, text: 'Sistema de valoraciones' },
              { icon: <Landmark size={16} />, text: '100% comunitario y gratuito' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                <span className="text-sky-mid">{icon}</span>
                <span className="text-white/80 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 'calc(40% - 110px)', width: '220px', height: '100%' }}
          viewBox="0 0 220 1000"
          preserveAspectRatio="none"
        >
          <motion.path d={WAVE_NAVY[0]} animate={{ d: WAVE_NAVY }} transition={wave} fill="#003B54" />
          <motion.path d={WAVE_WHITE[0]} animate={{ d: WAVE_WHITE }} transition={wave} fill="white" />
        </svg>

        <div
          className="flex-1 flex items-center justify-center overflow-y-auto py-8"
          style={{ paddingLeft: '120px', paddingRight: '10%' }}
        >
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={submit}
            className="w-full max-w-sm my-auto"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-1">Crear cuenta</h2>
            <p className="text-sm text-gray-400 mb-6">Completá tus datos para registrarte</p>
            {formFields}
          </motion.form>
        </div>
      </div>
    </>
  );
}
