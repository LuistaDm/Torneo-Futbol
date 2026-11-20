import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/modules/administration/authorization";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
