export type EstadoFiltro = 'todos'|'activa'|'por_vencer'|'vencida';

export default function SearchBar({
  q, onQ, estado, onEstado, placeholder = 'Buscar…'
}: {
  q: string;
  onQ: (v:string)=>void;
  estado: EstadoFiltro;
  onEstado: (v:EstadoFiltro)=>void;
  placeholder?: string;
}) {
  return (
    <div className="card p-3 flex flex-col sm:flex-row gap-3">
      <input
        className="input flex-1"
        placeholder={placeholder}
        value={q}
        onChange={e=>onQ(e.target.value)}
      />
      <select
        className="select w-full sm:w-60"
        value={estado}
        onChange={e=>onEstado(e.target.value as EstadoFiltro)}
      >
        <option value="todos">Todos los estados</option>
        <option value="activa">Activa</option>
        <option value="por_vencer">Por vencer (≤7d)</option>
        <option value="vencida">Vencida</option>
      </select>
    </div>
  );
}
