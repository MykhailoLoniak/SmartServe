import crypto from "node:crypto";

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const generateSessionToken = () => crypto.randomUUID();
