import type { AuditAction, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: AuditAction;
  userId?: number | null;
  restaurantId?: number | null;
  entityType: string;
  entityId?: string | null;
  requestId?: string;
  details?: Record<string, unknown>;
};

type AuditClient = Pick<Prisma.TransactionClient, "auditLog">;

export const writeAuditLog = async ({ details, ...input }: AuditInput, client: AuditClient = prisma) => {
  await client.auditLog.create({
    data: {
      ...input,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
    },
  });
};
