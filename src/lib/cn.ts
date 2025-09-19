/**
 * Utility to join class names conditionally.
 * @param classes - List of class names, falsy values are ignored.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
