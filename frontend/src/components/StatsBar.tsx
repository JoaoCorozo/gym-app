export default function StatsBar({
  items
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((it, idx)=>(
        <div key={idx} className="card p-4">
          <div className="text-sm text-gray-500">{it.label}</div>
          <div className="text-2xl font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
