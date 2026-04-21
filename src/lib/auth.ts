import { headers } from "next/headers";

import { parseAccessList, isAuthorizedRestaurantSlug, type AccessScope } from "@/lib/accessControl";
import { prisma } from "@/lib/prisma";

export type SmartServeRole = "ADMIN" | "STAFF";

type AuthSession = {
  username: string;
  role: SmartServeRole;
  access: AccessScope;
};

const parseBasicHeader = (authorization: string | null): { username: string; password: string } | null => {
  if (!authorization || !authorization.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = authorization.slice(6).trim();
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const delimiterIndex = decoded.indexOf(":");

    if (delimiterIndex <= 0) {
      return null;
    }

    return {
      username: decoded.slice(0, delimiterIndex),
      password: decoded.slice(delimiterIndex + 1),
    };
  } catch {
    return null;
  }
};

type AuthProvider = {
  username: string;
  password: string;
  role: SmartServeRole;
  access: AccessScope;
};

const buildAuthProviders = (): AuthProvider[] => {
  const adminUsername = process.env.SMARTSERVE_ADMIN_USERNAME;
  const adminPassword = process.env.SMARTSERVE_ADMIN_PASSWORD;
  const staffUsername = process.env.SMARTSERVE_STAFF_USERNAME;
  const staffPassword = process.env.SMARTSERVE_STAFF_PASSWORD;

  const providers: Array<AuthProvider | null> = [
    adminUsername && adminPassword
      ? {
          username: adminUsername,
          password: adminPassword,
          role: "ADMIN" as const,
          access: parseAccessList(process.env.SMARTSERVE_ADMIN_RESTAURANTS),
        }
      : null,
    staffUsername && staffPassword
      ? {
          username: staffUsername,
          password: staffPassword,
          role: "STAFF" as const,
          access: parseAccessList(process.env.SMARTSERVE_STAFF_RESTAURANTS),
        }
      : null,
  ];

  return providers.filter((provider): provider is AuthProvider => provider !== null);
};


export async function getAuthSession(): Promise<AuthSession | null> {
  const authHeader = (await headers()).get("authorization");
  const credentials = parseBasicHeader(authHeader);

  if (!credentials) {
    return null;
  }

  const provider = buildAuthProviders().find(
    (entry) => entry.username === credentials.username && entry.password === credentials.password,
  );

  if (!provider) {
    return null;
  }

  return {
    username: provider.username,
    role: provider.role,
    access: provider.access,
  };
}

export async function requireAuth(roles?: SmartServeRole[]) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (roles && !roles.includes(session.role)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireRestaurantAccessBySlug(slug: string, roles?: SmartServeRole[]) {
  const session = await requireAuth(roles);

  if (!isAuthorizedRestaurantSlug(session.access, slug)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireRestaurantAccessById(restaurantId: number, roles?: SmartServeRole[]) {
  const session = await requireAuth(roles);

  if (session.access === "*") {
    return session;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });

  if (!restaurant || !session.access.has(restaurant.slug.toLowerCase())) {
    throw new Error("Forbidden");
  }

  return session;
}
