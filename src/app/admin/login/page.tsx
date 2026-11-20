import { redirect } from "next/navigation";
import { loginAdmin } from "@/modules/administration/auth-actions";
import { hasAdminSession } from "@/infrastructure/auth/session";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  if (await hasAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
    <form action={loginAdmin} className="w-full max-w-sm space-y-5 rounded-xl bg-white p-7 shadow-xl">
      <div><p className="text-sm font-semibold tracking-wider text-emerald-700">FÚTBOL COMPAÑÍA</p><h1 className="mt-1 text-2xl font-bold">Acceso administrativo</h1><p className="mt-2 text-sm text-slate-600">Ingresá la contraseña de organización.</p></div>
      {typeof error === "string" && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-medium">Contraseña<input name="password" type="password" required autoFocus className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
      <button className="w-full rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">Ingresar</button>
    </form>
  </main>;
}
