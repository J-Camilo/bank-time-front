import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';
import { useToast } from '../components/ui/Toast';

const DEPS: Record<string, string[]> = {
  Antioquia: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'],
  Cundinamarca: ['Bogotá', 'Soacha', 'Zipaquirá', 'Facatativá'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura'],
  Atlántico: ['Barranquilla', 'Soledad', 'Malambo'],
  Bolívar: ['Cartagena', 'Magangué', 'Turbaco'],
};

export default function Register() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [dep, setDep] = useState('');
  const [f, setF] = useState({ nombre: '', apellido: '', correo: '', municipio: '', direccion: '', contrasena: '', confirmar: '' });

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden py-6">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl mx-4">

        {/* Left blob */}
        <div className="relative w-2/5 bg-navy flex-shrink-0 overflow-hidden min-h-[580px]">
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -bottom-16 -right-12 w-72 h-72 rounded-full" style={{ background: 'rgba(0,177,252,0.15)' }} />
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -top-20 -left-10 w-80 h-80 rounded-full" style={{ background: 'rgba(0,130,186,0.2)' }} />
        </div>

        {/* Right: form */}
        <div className="flex-1 bg-white flex flex-col justify-center px-10 py-8">
          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit}
            className="w-full max-w-xs mx-auto space-y-2.5">

            <input className="input-field" placeholder="Ingrese su nombre" value={f.nombre}
              onChange={e => update('nombre', e.target.value)} required />
            <input className="input-field" placeholder="Ingrese apellido" value={f.apellido}
              onChange={e => update('apellido', e.target.value)} required />
            <input className="input-field" type="email" placeholder="Ingrese correo electrónico" value={f.correo}
              onChange={e => update('correo', e.target.value)} required />

            <select className="input-field" value={dep}
              onChange={e => { setDep(e.target.value); update('municipio', ''); }}>
              <option value="">Selecciona el departamento</option>
              {Object.keys(DEPS).map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select className="input-field" value={f.municipio} disabled={!dep}
              onChange={e => update('municipio', e.target.value)}>
              <option value="">Selecciona el municipio</option>
              {(DEPS[dep] || []).map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <input className="input-field" placeholder="Ingrese su dirección" value={f.direccion}
              onChange={e => update('direccion', e.target.value)} />
            <input className="input-field" type="password" placeholder="Ingrese su contraseña" value={f.contrasena}
              onChange={e => update('contrasena', e.target.value)} required />
            <input className="input-field" type="password" placeholder="Confirme su contraseña" value={f.confirmar}
              onChange={e => update('confirmar', e.target.value)} required />

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-center mt-2">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <div className="text-center space-y-1 pt-1">
              <p className="text-sm text-sky-mid cursor-pointer hover:underline">¿Olvidaste tu contraseña?</p>
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-navy font-semibold hover:underline">Ingresa aquí</Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
