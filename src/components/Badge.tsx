export default function Badge({
  kind,
  children,
}: {
  kind: 'activa' | 'por_vencer' | 'vencida' | 'default';
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    activa: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    por_vencer: 'bg-amber-50 text-amber-700 ring-amber-200',
    vencida: 'bg-rose-50 text-rose-700 ring-rose-200',
    default: 'bg-gray-50 text-gray-700 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${map[kind] ?? map.default}`}>
      {children}
    </span>
  );
}
