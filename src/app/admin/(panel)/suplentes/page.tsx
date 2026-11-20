import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function SubstitutesPage({ searchParams }: { searchParams: Promise<{ seasonId?: string; level?: string }> }) {
  const { seasonId, level } = await searchParams;
  const [seasons, levels, substitutes] = await Promise.all([
    prisma.season.findMany({ orderBy: { calendarYear: "desc" } }),
    prisma.skillLevel.findMany({ orderBy: { value: "asc" } }),
    prisma.playerSeason.findMany({ where: { status: "SUBSTITUTE", ...(seasonId ? { seasonId } : {}), ...(level ? { skillLevel: { value: Number(level) } } : {}) }, include: { person: true, season: true, skillLevel: true, memberships: { where: { leftAt: null } } }, orderBy: { person: { lastName: "asc" } } }),
  ]);
  return <><AdminPageHeader title="Suplentes" description="Jugadores de una temporada sin pertenencia activa a un equipo." /><form className="mb-4 flex flex-wrap gap-2"><select name="seasonId" defaultValue={seasonId} className="rounded border bg-white p-2 text-sm"><option value="">Todas las temporadas</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select><select name="level" defaultValue={level} className="rounded border bg-white p-2 text-sm"><option value="">Todos los niveles</option>{levels.map((skill) => <option key={skill.id} value={skill.value}>Nivel {skill.value}</option>)}</select><button className="rounded border border-slate-300 px-3 text-sm">Filtrar</button></form>
    <section className="overflow-hidden rounded-lg bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Jugador</th><th className="p-3">Temporada</th><th className="p-3">Nivel</th><th className="p-3" /></tr></thead><tbody>{substitutes.map((player) => <tr key={player.id} className="border-t"><td className="p-3 font-medium">{player.person.firstName} {player.person.lastName}</td><td className="p-3">{player.season.name}</td><td className="p-3">{player.skillLevel.value}</td><td className="p-3 text-right"><Link className="text-emerald-700 underline" href={`/admin/equipos?seasonId=${player.seasonId}`}>Asignar a un equipo</Link></td></tr>)}</tbody></table>{substitutes.length === 0 && <p className="p-5 text-sm text-slate-500">No hay suplentes con esos filtros.</p>}</section>
  </>;
}
