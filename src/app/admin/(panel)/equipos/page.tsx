import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell";
import { createTeam } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ seasonId?: string }> }) {
  const { seasonId } = await searchParams;
  const [seasons, teams] = await Promise.all([
    prisma.season.findMany({ include: { championship: true }, orderBy: { calendarYear: "desc" } }),
    prisma.team.findMany({ where: seasonId ? { seasonId } : undefined, include: { season: true, memberships: { where: { leftAt: null }, include: { playerSeason: { include: { skillLevel: true } } } } }, orderBy: { name: "asc" } }),
  ]);
  return <><AdminPageHeader title="Equipos" description="Cada equipo pertenece exclusivamente a una temporada." />
    <section className="mb-6 rounded-lg bg-white p-5 shadow-sm"><h2 className="font-semibold">Crear equipo</h2>{seasons.length ? <form action={createTeam} className="mt-4 flex flex-wrap items-end gap-3"><label className="text-sm">Temporada<select name="seasonId" required defaultValue={seasonId} className="mt-1 block rounded border p-2">{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label><label className="text-sm">Nombre<input name="name" required placeholder="Ferrari" className="mt-1 block rounded border p-2" /></label><button className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Crear equipo</button></form> : <p className="mt-3 text-sm text-slate-600">Primero creá una temporada.</p>}</section>
    <form className="mb-3 flex gap-2"><select name="seasonId" defaultValue={seasonId} className="rounded border bg-white p-2 text-sm"><option value="">Todas las temporadas</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select><button className="rounded border border-slate-300 px-3 text-sm">Filtrar</button></form>
    <section className="overflow-hidden rounded-lg bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Equipo</th><th className="p-3">Temporada</th><th className="p-3">Plantel</th><th className="p-3">Nivel total</th><th className="p-3" /></tr></thead><tbody>{teams.map((team) => { const levelTotal = team.memberships.reduce((total, membership) => total + membership.playerSeason.skillLevel.value, 0); return <tr key={team.id} className="border-t"><td className="p-3 font-medium">{team.name}</td><td className="p-3">{team.season.name}</td><td className="p-3">{team.memberships.length}</td><td className="p-3">{levelTotal} {levelTotal > 0 && (levelTotal < 18 || levelTotal > 21) && <span className="ml-1 text-xs text-amber-700">Fuera de guía</span>}</td><td className="p-3 text-right"><Link className="text-emerald-700 underline" href={`/admin/equipos/${team.id}`}>Plantel</Link></td></tr>; })}</tbody></table></section>
  </>;
}
