export default function Ubicacion() {
  // Puedes ajustar el "q=BodyForge Gimnasio, Santiago" a tu dirección exacta
  const mapSrc =
    'https://www.google.com/maps?q=BodyForge%20Gimnasio%2C%20Santiago&output=embed';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ubicación</h1>

      <div className="card overflow-hidden">
        <div className="aspect-[16/9] w-full">
          <iframe
            title="Mapa BodyForge"
            src={mapSrc}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg">BodyForge — Sede Central</h2>
        <p className="text-neutral-700 mt-2">
          Dirección: Av. Ejemplo 1234, Santiago, Chile
        </p>
        <p className="text-neutral-700">Horario: L–V 6:00–22:00 • S 8:00–20:00 • D 9:00–14:00</p>
        <p className="text-neutral-700">Teléfono: +56 2 2345 6789</p>
        <p className="text-neutral-700">Email: contacto@bodyforge.cl</p>
      </div>
    </div>
  );
}
