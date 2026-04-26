/**
 * Escape user input for safe use inside a Mongo regex.
 * Mitigates ReDoS and NoSQL Injection vulnerabilities.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
