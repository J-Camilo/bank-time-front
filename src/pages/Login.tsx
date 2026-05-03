import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Landmark, Clock, Users, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth';
import { setCredentials } from '../store/slices/authSlice';
import { useToast } from '../components/ui/Toast';

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

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { show } = useToast();
  const [correo, setCorreo]         = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading]       = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(correo, contrasena);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
      show(`¡Bienvenido, ${data.user.nombre}!`);
      navigate('/dashboard');
    } catch (err: any) {
      show(err.response?.data?.error || 'Credenciales incorrectas', 'error');
    } finally { setLoading(false); }
  };

  const wave = { duration: 7, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <>
      {/* ── Mobile (< sm) ─────────────────────────────────── */}
      <div className="sm:hidden min-h-screen bg-white flex flex-col">
        <div className="bg-navy flex items-end justify-center pb-8 pt-14 flex-shrink-0"
          style={{ borderRadius: '0 0 40px 40px' }}>
          <div className="text-center text-white px-6">
            <Landmark size={36} className="mx-auto mb-3 opacity-80" />
            <h1 className="text-4xl font-black tracking-tight">BOTIme.</h1>
            <p className="text-white/60 text-sm mt-1">Intercambia tiempo, crea comunidad</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <form onSubmit={submit} className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Bienvenido de vuelta</h2>
            <p className="text-sm text-gray-400 mb-6">Ingresá tus datos para continuar</p>
            <div className="space-y-4 mb-6">
              <input className="input-field" type="email" placeholder="Correo electrónico"
                value={correo} onChange={e => setCorreo(e.target.value)} required />
              <input className="input-field" type="password" placeholder="Contraseña"
                value={contrasena} onChange={e => setContrasena(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mb-5">
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
            <div className="text-center space-y-2">
              {/* <p className="text-sm text-sky-mid cursor-pointer hover:underline">¿Olvidaste tu contraseña?</p> */}
              <p className="text-sm text-gray-600">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="text-navy font-semibold hover:underline">Regístrate aquí</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ── Desktop (≥ sm) ─────────────────────────────────── */}
      <div className="hidden sm:flex h-screen bg-white relative overflow-hidden">

        {/* Navy left panel — with brand content */}
        <div className="flex-shrink-0 bg-navy relative flex flex-col justify-between py-14 px-10 overflow-hidden"
          style={{ width: '40%' }}>
          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #009ADB, transparent)' }} />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #009ADB, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <Landmark size={22} className="text-white" />
            </div>
            <span className="text-white font-black text-2xl tracking-tight">BOTIme.</span>
          </motion.div>

          {/* Main copy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative z-10">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Intercambia<br />tiempo,<br />crea comunidad.
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Una plataforma donde tus habilidades tienen valor. Ofrece lo que sabés, recibí lo que necesitás.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative z-10 flex gap-6">
            <div className="bg-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Users size={20} className="text-sky-mid flex-shrink-0" />
              <div>
                <p className="text-white font-black text-xl leading-none">500+</p>
                <p className="text-white/50 text-xs mt-0.5">Usuarios activos</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Clock size={20} className="text-sky-mid flex-shrink-0" />
              <div>
                <p className="text-white font-black text-xl leading-none">1200+</p>
                <p className="text-white/50 text-xs mt-0.5">Horas intercambiadas</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* S-wave SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 'calc(40% - 110px)', width: '220px', height: '100%' }}
          viewBox="0 0 220 1000"
          preserveAspectRatio="none"
        >
          <motion.path d={WAVE_NAVY[0]} animate={{ d: WAVE_NAVY }} transition={wave} fill="#003B54" />
          <motion.path d={WAVE_WHITE[0]} animate={{ d: WAVE_WHITE }} transition={wave} fill="white" />
        </svg>

        {/* Right: form area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 flex items-center justify-center py-10 relative"
          style={{ paddingLeft: '100px', paddingRight: '8%' }}
        >
          {/* Decorative dot grid */}
          <div className="absolute top-12 right-12 opacity-30"
            style={{
              width: 120, height: 120,
              backgroundImage: 'radial-gradient(circle, #009ADB 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="absolute bottom-12 right-16 opacity-20"
            style={{
              width: 80, height: 80,
              backgroundImage: 'radial-gradient(circle, #003B54 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />

          <form onSubmit={submit} className="w-full max-w-sm relative z-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h2 className="text-3xl font-black text-gray-900 mb-1">Bienvenido de vuelta</h2>
              <p className="text-sm text-gray-400 mb-8">Ingresá tus datos para continuar</p>
            </motion.div>

            <div className="space-y-4 mb-6">
              <input className="input-field" type="email" placeholder="Correo electrónico"
                value={correo} onChange={e => setCorreo(e.target.value)} required />
              <input className="input-field" type="password" placeholder="Contraseña"
                value={contrasena} onChange={e => setContrasena(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mb-5 flex items-center gap-2">
              {loading ? 'Cargando...' : <><span>Iniciar sesión</span><ArrowRight size={16} /></>}
            </button>

            <div className="text-center space-y-2">
              {/* <p className="text-sm text-sky-mid cursor-pointer hover:underline">¿Olvidaste tu contraseña?</p> */}
              <p className="text-sm text-gray-600">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="text-navy font-semibold hover:underline">Regístrate aquí</Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
