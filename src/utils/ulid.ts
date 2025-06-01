import { ulid } from "ulid";

export function generateULID(): string {
  return ulid();
}

export function isValidULID(id: string): boolean {
  // ULID contains only Crockford's Base32 characters
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(id);
}
