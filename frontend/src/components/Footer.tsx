export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <img src="/bodyforge.svg" alt="BodyForge" className="h-6 w-6" />
            <span className="font-bold text-forge-600">BodyForge</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Forja tu mejor versión. Gestión inteligente para gimnasios.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Producto</h4>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li><a className="hover:text-forge-700" href="#">Clientes</a></li>
            <li><a className="hover:text-forge-700" href="#">Planes</a></li>
            <li><a className="hover:text-forge-700" href="#">Suscripciones</a></li>
            <li><a className="hover:text-forge-700" href="#">Panel Admin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Compañía</h4>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li><a className="hover:text-forge-700" href="#">Sobre BodyForge</a></li>
            <li><a className="hover:text-forge-700" href="#">Contacto</a></li>
            <li><a className="hover:text-forge-700" href="#">Soporte</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Legal</h4>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li><a className="hover:text-forge-700" href="#">Términos</a></li>
            <li><a className="hover:text-forge-700" href="#">Privacidad</a></li>
            <li><a className="hover:text-forge-700" href="#">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-[var(--muted)] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BodyForge. Todos los derechos reservados.</span>
          <span>Hecho con ❤️ y 🍊</span>
        </div>
      </div>
    </footer>
  );
}
