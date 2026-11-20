import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/shell";
import { updateChampionship } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function ChampionshipDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params; const { notice } = await searchParams;
  const championship = await prisma.championship.findUniqueOrThrow({ where: { id }, include: { seasons: { orderBy: [{ calendarYear: "desc" }, { kind: "asc" }] } } });
  return <><AdminPageHeader title={championship.name} description="Editar datos y consultar sus temporadas."><Link href={`/admin/temporadas?championshipId=${id}`} className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Nueva temporada</Link></AdminPageHeader><Notice value={notice} />
    <section className="rounded-lg bg-white p-5 shadow-sm"><form action={updateChampionship} className="grid gap-3 sm:grid-cols-3"><input type="hidden" name="id" value={id} /><label className="text-sm">Número<input name="number" type="number" defaultValue={championship.number} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Año<input name="calendarYear" type="number" defaultValue={championship.calendarYear} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Nombre<input name="name" defaultValue={championship.name} className="mt-1 w-full rounded border p-2" /></label><button className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Guardar cambios</button></form></section>
    <section className="mt-6 rounded-lg bg-white p-5 shadow-sm"><h2 className="font-semibold">Temporadas</h2><div className="mt-3 divide-y">{championship.seasons.map((season) => <Link key={season.id} href={`/admin/temporadas/${season.id}`} className="flex items-center justify-between py-3 text-sm hover:text-emerald-700"><span>{season.name}</span><span className="text-slate-500">{season.kind} · {season.status}</span></Link>)}{championship.seasons.length === 0 && <p className="py-3 text-sm text-slate-500">Aún no hay temporadas.</p>}</div></section>
  </>;
}
