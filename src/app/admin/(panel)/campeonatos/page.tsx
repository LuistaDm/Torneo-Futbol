import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell";
import { createChampionship } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export default async function ChampionshipsPage() {
  const championships = await prisma.championship.findMany({ include: { _count: { select: { seasons: true } } }, orderBy: [{ calendarYear: "desc" }, { number: "desc" }] });
  return <><AdminPageHeader title="Campeonatos" description="Cada campeonato anual agrupa Apertura y Clausura." />
    <section className="mb-6 rounded-lg bg-white p-5 shadow-sm"><h2 className="font-semibold">Crear campeonato</h2><form action={createChampionship} className="mt-4 grid gap-3 sm:grid-cols-4"><label className="text-sm">Número<input required name="number" type="number" min="1" className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Año<input required name="calendarYear" type="number" min="2000" className="mt-1 w-full rounded border p-2" /></label><label className="text-sm sm:col-span-2">Nombre<input required name="name" placeholder="Campeonato 46" className="mt-1 w-full rounded border p-2" /></label><button className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white sm:col-start-4">Crear</button></form></section>
    <section className="overflow-hidden rounded-lg bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Campeonato</th><th className="p-3">Año</th><th className="p-3">Temporadas</th><th className="p-3" /></tr></thead><tbody>{championships.map((item) => <tr key={item.id} className="border-t"><td className="p-3 font-medium">{item.name}</td><td className="p-3">{item.calendarYear}</td><td className="p-3">{item._count.seasons}</td><td className="p-3 text-right"><Link className="text-emerald-700 underline" href={`/admin/campeonatos/${item.id}`}>Ver y editar</Link></td></tr>)}</tbody></table>{championships.length === 0 && <p className="p-5 text-sm text-slate-500">Todavía no hay campeonatos.</p>}</section>
  </>;
}
