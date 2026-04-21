export type AccessScope = "*" | Set<string>;

export const parseAccessList = (raw: string | undefined): AccessScope => {
  if (!raw || raw.trim() === "" || raw.trim() === "*") {
    return "*";
  }

  return new Set(
    raw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
};

export const isAuthorizedRestaurantSlug = (access: AccessScope, slug: string) =>
  access === "*" || access.has(slug.toLowerCase());
