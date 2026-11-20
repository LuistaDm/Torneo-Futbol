"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, isValidAdminPassword } from "@/infrastructure/auth/session";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!isValidAdminPassword(password)) redirect("/admin/login?error=Contraseña+incorrecta+o+configuración+incompleta");
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}
