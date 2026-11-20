import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
};

export async function recordAudit(input: AuditInput) {
  await prisma.auditLog.create({ data: { ...input, actorLabel: "admin" } });
}
