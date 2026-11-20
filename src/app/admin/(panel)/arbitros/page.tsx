import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell";
import { createReferee } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function RefereesPage() {
  const referees = await prisma.referee.findMany({ include: { person: true, _count: { select: { assignments: true } } }, orderBy: { person: { lastName: "asc" } } });
  return <><AdminPageHeader title="Árbitros" description="Los árbitros no tienen cuentas ni perfiles públicos." />
    <section className="mb-6 rounded-lg bg-white p-5 shadow-sm"><h2 className="font-semibold">Crear árbitro</h2><form action={createReferee} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><label className="text-sm">Nombre<input required name="firstName" className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Apellido<input required name="lastName" className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">DNI<input required name="dni" className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Email<input type="email" name="email" className="mt-1 w-full rounded border p-2" /></label><button className="self-end w-fit rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Crear árbitro</button></form></section>
    <section className="overflow-hidden rounded-lg bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Árbitro</th><th className="p-3">Email</th><th className="p-3">Partidos asignados</th><th className="p-3" /></tr></thead><tbody>{referees.map((referee) => <tr key={referee.id} className="border-t"><td className="p-3 font-medium">{referee.person.firstName} {referee.person.lastName}</td><td className="p-3">{referee.person.email ?? "—"}</td><td className="p-3">{referee._count.assignments}</td><td className="p-3 text-right"><Link className="text-emerald-700 underline" href={`/admin/arbitros/${referee.id}`}>Editar</Link></td></tr>)}</tbody></table>{referees.length === 0 && <p className="p-5 text-sm text-slate-500">Todavía no hay árbitros.</p>}</section>
  </>;
}
