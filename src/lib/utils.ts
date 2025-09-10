export const notNull = <T>(v: T | null | undefined): v is T => v != null;
