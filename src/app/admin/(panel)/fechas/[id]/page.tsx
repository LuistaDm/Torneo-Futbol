import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/shell";
import { updateMatchday } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function MatchdayDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params; const { notice } = await searchParams;
  const matchday = await prisma.matchday.findUniqueOrThrow({ where: { id }, include: { season: true, phase: true, _count: { select: { matches: true } } } });
  return <><AdminPageHeader title={matchday.label || `Fecha ${matchday.order}`} description={`${matchday.season.name} · ${matchday.phase.name}`}><Link className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" href={`/admin/partidos?matchdayId=${id}`}>Partidos</Link></AdminPageHeader><Notice value={notice} />
    <section className="rounded-lg bg-white p-5 shadow-sm"><form action={updateMatchday} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><input type="hidden" name="id" value={id} /><label className="text-sm">Número<input name="order" type="number" min="1" defaultValue={matchday.order} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Nombre opcional<input name="label" defaultValue={matchday.label ?? ""} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Día<input name="scheduledOn" type="date" defaultValue={matchday.scheduledOn?.toISOString().slice(0, 10)} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Estado<select name="status" defaultValue={matchday.status} className="mt-1 w-full rounded border p-2"><option value="PLANNED">Planificada</option><option value="COMPLETED">Completada</option><option value="POSTPONED">Postergada</option></select></label><button className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Guardar fecha</button></form><p className="mt-4 text-sm text-slate-500">Partidos asociados: {matchday._count.matches}</p></section>
  </>;
}
