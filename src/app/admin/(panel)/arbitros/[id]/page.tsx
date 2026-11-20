import { AdminPageHeader, Notice } from "@/components/admin/shell";
import { updateReferee } from "@/modules/administration/actions";
import { prisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";
export default async function RefereeDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params; const { notice } = await searchParams;
  const referee = await prisma.referee.findUniqueOrThrow({ where: { id }, include: { person: true, _count: { select: { assignments: true } } } });
  return <><AdminPageHeader title={`${referee.person.firstName} ${referee.person.lastName}`} description={`${referee._count.assignments} partido(s) asignado(s)`} /><Notice value={notice} />
    <section className="rounded-lg bg-white p-5 shadow-sm"><form action={updateReferee} className="grid gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={id} /><label className="text-sm">Nombre<input name="firstName" defaultValue={referee.person.firstName} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Apellido<input name="lastName" defaultValue={referee.person.lastName} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">DNI<input name="dni" defaultValue={referee.person.dni} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Email<input name="email" type="email" defaultValue={referee.person.email ?? ""} className="mt-1 w-full rounded border p-2" /></label><button className="w-fit rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Guardar árbitro</button></form></section>
  </>;
}
