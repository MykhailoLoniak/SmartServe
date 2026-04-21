import type { AuditAction } from "@prisma/client";

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

export const writeAuditLog = async ({ details, ...input }: AuditInput) => {
  await prisma.auditLog.create({
    data: {
      ...input,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
    },
  });
};
