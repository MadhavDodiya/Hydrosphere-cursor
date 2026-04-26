/**
 * Escape user input for safe use inside a Mongo regex.
 * Prevents ReDoS and NoSQL Injection via regex.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
