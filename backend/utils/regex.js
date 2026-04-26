/**
 * Escape user input for safe use inside a Mongo regex.
 * Prevents NoSQL Injection and ReDoS vulnerabilities.
 */
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
