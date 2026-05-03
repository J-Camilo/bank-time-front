import { useEffect, useState } from 'react';
import { Clock, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { solicitudesService } from '../services/solicitudes';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';

export default function SolicitudesEnviadas() {
  const { show } = useToast();
  const [list, setList]             = useState<any[]>([]);
  const [sel, setSel]               = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [acting, setActing]         = useState(false);
  const [saving, setSaving]         = useState(false);

  // edit state (solo PENDIENTE)
  const [editFecha, setEditFecha]   = useState('');
  const [editHora, setEditHora]     = useState('');
  const [editMinuto, setEditMinuto] = useState('00');
  const [editAmpm, setEditAmpm]     = useState<'AM' | 'PM'>('AM');

  const syncEdit = (s: any) => {
    if (!s?.fecha_propuesta) {
      setEditFecha('');
      setEditHora('');
      setEditMinuto('00');
      setEditAmpm('AM');
      return;
    }
    const d = dayjs(s.fecha_propuesta);
    setEditFecha(d.format('YYYY-MM-DD'));
    const h24 = d.hour();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    setEditHora(String(h12));
    setEditMinuto(d.format('mm'));
    setEditAmpm(ampm);
  };

  useEffect(() => {
    solicitudesService.enviadas()
      .then(r => {
        setList(r.data);
        if (r.data.length) { setSel(r.data[0]); syncEdit(r.data[0]); }
      })
      .catch(() => show('Error al cargar solicitudes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    setLoading(true);
    solicitudesService.enviadas()
      .then(r => {
        setList(r.data);
        const first = r.data.length ? r.data[0] : null;
        setSel(first);
        syncEdit(first);
        setShowDetail(false);
      })
      .catch(() => show('Error al cargar solicitudes', 'error'))
      .finally(() => setLoading(false));
  };

  const handleDescartar = async () => {
    if (!sel) return;
    setActing(true);
    try {
      await solicitudesService.cancelar(sel.id);
      show('Solicitud descartada', 'success');
      reload();
    } catch {
      show('Error al descartar la solicitud', 'error');
    } finally {
      setActing(false);
    }
  };

  const handleGuardar = async () => {
    if (!sel || !editFecha) { show('Completá la fecha', 'error'); return; }
    setSaving(true);
    try {
      let h24 = parseInt(editHora) || 12;
      if (editAmpm === 'PM' && h24 !== 12) h24 += 12;
      if (editAmpm === 'AM' && h24 === 12) h24 = 0;
      const fecha_propuesta = dayjs(`${editFecha}T${String(h24).padStart(2, '0')}:${editMinuto.padStart(2, '0')}:00`).toISOString();
      const updated = await solicitudesService.actualizar(sel.id, { fecha_propuesta });
      const merged = { ...sel, ...updated.data };
      setSel(merged);
      setList(prev => prev.map(s => s.id === sel.id ? merged : s));
      show('Solicitud actualizada', 'success');
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (s: any) => {
    setSel(s);
    syncEdit(s);
    setShowDetail(true);
  };

  const SolicitudCard = ({ s }: { s: any }) => {
    const active = sel?.id === s.id;
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => handleSelect(s)}
        className={`p-4 rounded-2xl mb-3 cursor-pointer transition-colors ${
          active ? 'bg-navy text-white' : 'bg-white border border-gray-100 hover:border-navy/20'
        }`}
      >
        <p className={`text-xs mb-1 ${active ? 'text-white/50' : 'text-gray-400'}`}>
          {s.fecha_propuesta
            ? `Propuesta: ${dayjs(s.fecha_propuesta).format('DD/MM/YYYY')}`
            : `Enviada: ${dayjs(s.created_at).format('DD/MM/YYYY')}`}
        </p>
        <h3 className={`font-bold text-base leading-snug mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>
          {s.publicacion_titulo}
        </h3>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            active
              ? 'bg-white/20 text-white'
              : s.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700'
              : s.estado === 'ACEPTADA'  ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-500'
          }`}>
            {s.estado}
          </span>
          <span className={`text-xs ${active ? 'text-white/60' : 'text-gray-400'}`}>
            {s.propietario_nombre} {s.propietario_apellido}
          </span>
        </div>
      </motion.div>
    );
  };

  const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left list */}
      <div className={`md:w-72 md:border-r border-gray-100 p-4 overflow-y-auto md:flex-shrink-0
        ${showDetail ? 'hidden md:block' : 'block'}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mis solicitudes</p>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl mb-3 animate-pulse" />)
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">No has enviado solicitudes aún</p>
        ) : (
          list.map(s => <SolicitudCard key={s.id} s={s} />)
        )}
      </div>

      {/* Right detail */}
      <div className={`flex-1 p-5 md:p-8 overflow-y-auto ${!showDetail ? 'hidden md:flex' : 'flex'} flex-col`}>
        {!sel ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecciona una solicitud</p>
          </div>
        ) : (
          <motion.div key={sel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Mobile back */}
            <button
              onClick={() => setShowDetail(false)}
              className="md:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Volver a mis solicitudes
            </button>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{sel.publicacion_titulo}</h1>
            <p className="text-sm text-gray-500 mb-6">
              Dueño del servicio: <span className="font-semibold">{sel.propietario_nombre} {sel.propietario_apellido}</span>
            </p>

            <div className="flex items-center gap-6 mb-6">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} />
                {sel.creditos_acordados != null ? `${sel.creditos_acordados} crédito(s)` : '1 crédito'}
              </span>
            </div>

            {/* Fecha y hora */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fecha y hora propuesta</p>

              {sel.estado === 'PENDIENTE' ? (
                <>
                  {/* Advertencia */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                    <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Si modificás la fecha u hora, el dueño del servicio puede rechazar la solicitud porque puede no estar disponible para el nuevo horario.
                    </p>
                  </div>

                  {/* Fecha editable */}
                  <p className="text-sm text-gray-600 mb-2">Fecha</p>
                  <input
                    type="date"
                    value={editFecha}
                    onChange={e => setEditFecha(e.target.value)}
                    min={dayjs().format('YYYY-MM-DD')}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-navy/15"
                  />

                  {/* Hora editable */}
                  <p className="text-sm text-gray-600 mb-2">Hora</p>
                  <div className="flex items-center gap-2 mb-4">
                    <select
                      value={editHora}
                      onChange={e => setEditHora(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none"
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-400">:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={editMinuto}
                      onChange={e => setEditMinuto(String(parseInt(e.target.value) || 0).padStart(2, '0'))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none w-16 text-center"
                    />
                    <select
                      value={editAmpm}
                      onChange={e => setEditAmpm(e.target.value as 'AM' | 'PM')}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </>
              ) : (
                /* Solo lectura para no-PENDIENTE */
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {sel.fecha_propuesta
                        ? dayjs(sel.fecha_propuesta).format('DD/MM/YYYY – HH:mm')
                        : 'Sin fecha definida'}
                    </span>
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Estado */}
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estado de la solicitud</p>
              <p className="text-sm text-gray-700">
                {sel.estado === 'PENDIENTE'  ? `Pendiente por aceptación de ${sel.propietario_nombre} ${sel.propietario_apellido}` :
                 sel.estado === 'ACEPTADA'   ? <span className="flex items-center gap-1.5 text-green-600"><CheckCircleOutlined /> Solicitud aceptada</span> :
                 sel.estado === 'RECHAZADA'  ? <span className="flex items-center gap-1.5 text-red-500"><CloseCircleOutlined /> Solicitud rechazada</span> :
                                               <span className="flex items-center gap-1.5 text-gray-400"><StopOutlined /> Solicitud cancelada</span>}
              </p>
            </div>

            {sel.estado === 'PENDIENTE' && (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={handleDescartar}
                  disabled={acting}
                  className="btn-outline disabled:opacity-50"
                >
                  {acting ? 'Descartando...' : 'Descartar solicitud'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
