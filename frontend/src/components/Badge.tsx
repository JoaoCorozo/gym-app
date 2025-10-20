export default function Badge({
  kind, children,
}: {
  kind: 'activa'|'por_vencer'|'vencida'|'default';
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    activa:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
    por_vencer: 'bg-amber-50 text-amber-700 ring-amber-200',
    vencida:    'bg-rose-50 text-rose-700 ring-rose-200',
    default:    'bg-neutral-100 text-neutral-700 ring-neutral-200',
  };
  return (
    <span className={`badge ${map[kind] ?? map.default}`}>
      {children}
    </span>
  );
}
