import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const activeSeason = await prisma.season.findFirst({ where: { status: "ACTIVE" }, include: { championship: true, _count: { select: { teams: true, playerSeasons: true } } }, orderBy: { calendarYear: "desc" } });
  const substitutes = activeSeason ? await prisma.playerSeason.count({ where: { seasonId: activeSeason.id, status: "SUBSTITUTE" } }) : 0;
  return <>
    <AdminPageHeader title="Inicio" description="Resumen administrativo del torneo." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Temporada activa" value={activeSeason ? activeSeason.name : "Sin definir"} detail={activeSeason ? activeSeason.championship.name : "Creá o activá una temporada"} />
      <Stat label="Equipos" value={activeSeason?._count.teams ?? 0} detail="En la temporada activa" />
      <Stat label="Jugadores" value={activeSeason?._count.playerSeasons ?? 0} detail="Perfiles de la temporada" />
      <Stat label="Suplentes" value={substitutes} detail="Sin plantel activo" />
    </div>
    <section className="mt-6 rounded-lg bg-white p-5 shadow-sm"><h2 className="font-semibold">Próximos módulos</h2><p className="mt-2 text-sm text-slate-600">Fases y zonas, fechas, partidos, planillas, disciplina, estadísticas y auditoría se agregarán en próximos bloques.</p><div className="mt-4 flex flex-wrap gap-3"><Link className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white" href="/admin/campeonatos">Gestionar campeonatos</Link><Link className="rounded border border-slate-300 px-3 py-2 text-sm font-medium" href="/admin/jugadores">Gestionar jugadores</Link></div></section>
  </>;
}

function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) { return <article className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>; }
