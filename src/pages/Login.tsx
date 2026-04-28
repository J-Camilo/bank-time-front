import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
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
    } finally {
      setLoading(false);
    }
  };

  const wave = { duration: 7, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <div className="h-screen bg-white relative flex overflow-hidden">
      {/* Navy left background */}
      <div className="flex-shrink-0 bg-navy" style={{ width: '40%' }} />

      {/* S-wave SVG animada */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 'calc(40% - 110px)', width: '220px', height: '100%' }}
        viewBox="0 0 220 1000"
        preserveAspectRatio="none"
      >
        <motion.path
          d={WAVE_NAVY[0]}
          animate={{ d: WAVE_NAVY }}
          transition={wave}
          fill="#003B54"
        />
        <motion.path
          d={WAVE_WHITE[0]}
          animate={{ d: WAVE_WHITE }}
          transition={wave}
          fill="white"
        />
      </svg>

      {/* Right: form area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center py-10"
        style={{ paddingLeft: '120px', paddingRight: '10%' }}
      >
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="space-y-4 mb-6">
            <input
              className="input-field"
              type="email"
              placeholder="Ingresar nombre de usuario"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Ingresar contraseña"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mb-5">
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-sky-mid cursor-pointer hover:underline">
              ¿Olvidaste tu contraseña?
            </p>
            <p className="text-sm text-gray-600">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/register" className="text-navy font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
