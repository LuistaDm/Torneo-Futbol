import Link from "next/link";
import { logoutAdmin } from "@/modules/administration/auth-actions";

const activeLinks = [
  ["Inicio", "/admin"], ["Campeonatos", "/admin/campeonatos"], ["Temporadas", "/admin/temporadas"],
  ["Jugadores", "/admin/jugadores"], ["Equipos", "/admin/equipos"], ["Suplentes", "/admin/suplentes"],
  ["Fases y zonas", "/admin/fases"], ["Fechas", "/admin/fechas"], ["Partidos", "/admin/partidos"], ["Árbitros", "/admin/arbitros"],
] as const;
const upcoming = ["Planillas", "Disciplina", "Estadísticas", "Auditoría"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/admin" className="font-bold tracking-tight">Fútbol Compañía <span className="text-emerald-400">Administración</span></Link>
        <form action={logoutAdmin}><button className="rounded border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800">Cerrar sesión</button></form>
      </div>
    </header>
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
      <aside className="w-full shrink-0 lg:w-56">
        <nav className="rounded-lg bg-white p-3 shadow-sm">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Gestión</p>
          <div className="grid gap-1 sm:grid-cols-3 lg:block">
            {activeLinks.map(([label, href]) => <Link key={href} href={href} className="block rounded px-3 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-800">{label}</Link>)}
          </div>
          <p className="mt-4 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Próximamente</p>
          <div className="grid gap-1 sm:grid-cols-3 lg:block">{upcoming.map((label) => <span key={label} className="block px-3 py-2 text-sm text-slate-400">{label}</span>)}</div>
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  </div>;
}

export function AdminPageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{description && <p className="mt-1 text-sm text-slate-600">{description}</p>}</div>{children}</div>;
}

export function Notice({ value }: { value?: string }) { return value ? <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{value}</p> : null; }
