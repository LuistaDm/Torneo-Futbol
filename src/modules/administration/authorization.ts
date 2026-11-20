import "server-only";

import { redirect } from "next/navigation";
import { hasAdminSession } from "@/infrastructure/auth/session";

export async function requireAdmin() {
  if (!(await hasAdminSession())) redirect("/admin/login");
}
