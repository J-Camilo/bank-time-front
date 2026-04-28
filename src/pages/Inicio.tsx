import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicacionesService } from '../services/publicaciones';
import { categoriasService } from '../services/categorias';
import PublicacionCard, { type Publicacion } from '../components/PublicacionCard/PublicacionCard';
import { SolicitudModal } from '../components/Modals/SolicitudModal';
import { useToast } from '../components/ui/Toast';

export default function Inicio() {
  const [params] = useSearchParams();
  const { show } = useToast();
  const q = params.get('q') || '';

  const [pubs, setPubs]             = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [catFilter, setCatFilter]   = useState<number | null>(null);
  const [catName, setCatName]       = useState('');
  const [modal, setModal]           = useState<{ open: boolean; pub: Publicacion | null }>({ open: false, pub: null });
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pubRes, catRes] = await Promise.all([
        publicacionesService.listar({ categoria_id: catFilter ?? undefined, limit: 24 }),
        categoriasService.listar(),
      ]);
      let data = pubRes.data.data as Publicacion[];
      if (q) data = data.filter(p => p.titulo.toLowerCase().includes(q.toLowerCase()));
      setPubs(data);
      setCategorias(catRes.data);
    } catch { show('Error al cargar publicaciones', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [catFilter, q]);

  const clearFilter = () => { setCatFilter(null); setCatName(''); };

  return (
    <div className="p-6 min-h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={() => setShowFilters(p => !p)}
          className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 hover:border-navy hover:text-navy transition-colors"
        >
          <Filter size={14} /> Filtros
        </button>
        {q && (
          <span className="text-sm text-gray-600">Resultados para <strong>"{q}"</strong></span>
        )}
        {catName && (
          <div className="flex items-center gap-1.5 bg-navy/10 text-navy rounded-full px-3 py-1.5 text-xs font-semibold">
            {catName}
            <button onClick={clearFilter}><X size={12} /></button>
          </div>
        )}
        {catName && (
          <button onClick={clearFilter} className="text-xs text-gray-400 hover:text-gray-600">Limpiar todo</button>
        )}
        <div className="ml-auto">
          <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-navy">
            <option>Ordenar por</option>
            <option>Más recientes</option>
            <option>Mejor valorados</option>
            <option>Más créditos</option>
          </select>
        </div>
      </div>

      {/* Category filter dropdown */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4">
          {categorias.map(c => (
            <button key={c.id}
              onClick={() => { setCatFilter(c.id); setCatName(c.nombre); setShowFilters(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                catFilter === c.id ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-navy/10 hover:text-navy'
              }`}>
              {c.nombre}
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : pubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-semibold">Sin publicaciones disponibles</p>
          <p className="text-sm mt-1">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pubs.map((pub, i) => (
            <PublicacionCard
              key={pub.id}
              pub={pub}
              index={i}
              onClick={(p) => setModal({ open: true, pub: p })}
            />
          ))}
        </div>
      )}

      <SolicitudModal
        pub={modal.pub}
        open={modal.open}
        onClose={() => setModal({ open: false, pub: null })}
        onSuccess={load}
      />
    </div>
  );
}
