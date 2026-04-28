import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { authService } from '../services/auth';
import { setCredentials } from '../store/slices/authSlice';
import { useToast } from '../components/ui/Toast';

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Full-page split layout */}
      <div className="w-full max-w-4xl h-[520px] flex rounded-2xl overflow-hidden shadow-2xl mx-4">

        {/* Left: dark organic blob area */}
        <div className="relative w-2/5 bg-navy flex-shrink-0 overflow-hidden">
          {/* Organic blob shapes */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], rotate: [0, 3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-16 -right-12 w-72 h-72 rounded-full"
            style={{ background: 'rgba(0,177,252,0.15)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -top-20 -left-10 w-80 h-80 rounded-full"
            style={{ background: 'rgba(0,130,186,0.2)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center px-8">
              <p className="text-4xl font-black tracking-tight mb-2">BOTIme.</p>
              <p className="text-sm text-white/60">Banco de Tiempo</p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center px-10">
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={submit}
            className="w-full max-w-xs"
          >
            <div className="space-y-3 mb-5">
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

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-center mb-3">
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>

            <div className="text-center space-y-1">
              <p className="text-sm text-sky-mid cursor-pointer hover:underline">¿Olvidaste tu contraseña?</p>
              <p className="text-sm text-gray-600">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="text-navy font-semibold hover:underline">Regístrate aquí</Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
