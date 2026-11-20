import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/shell";
import { updatePerson } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function PlayerDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params; const { notice } = await searchParams;
  const player = await prisma.playerSeason.findUniqueOrThrow({ where: { id }, include: { person: true, season: true, skillLevel: true, memberships: { where: { leftAt: null }, include: { team: true } } } });
  const date = player.person.birthDate ? player.person.birthDate.toISOString().slice(0, 10) : "";
  return <><AdminPageHeader title={`${player.person.firstName} ${player.person.lastName}`} description={`${player.season.name} · Nivel ${player.skillLevel.value}`}><Link href={`/admin/equipos?seasonId=${player.seasonId}`} className="rounded border border-slate-300 px-3 py-2 text-sm">Ver equipos</Link></AdminPageHeader><Notice value={notice} />
    <section className="rounded-lg bg-white p-5 shadow-sm"><form action={updatePerson} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="id" value={player.personId} /><input type="hidden" name="returnTo" value={`/admin/jugadores/${id}`} /><label className="text-sm">Nombre<input name="firstName" defaultValue={player.person.firstName} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Apellido<input name="lastName" defaultValue={player.person.lastName} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">DNI<input name="dni" defaultValue={player.person.dni} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Nacimiento<input name="birthDate" type="date" defaultValue={date} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Email<input name="email" type="email" defaultValue={player.person.email ?? ""} className="mt-1 w-full rounded border p-2" /></label><div className="text-sm"><span className="block">Situación deportiva</span><p className="mt-1 rounded border bg-slate-50 p-2">{player.memberships[0]?.team.name ?? "Suplente"} · nivel fijo {player.skillLevel.value}</p></div><button className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Guardar datos personales</button></form></section>
  </>;
}
