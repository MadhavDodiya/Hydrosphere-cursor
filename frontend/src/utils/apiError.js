/**
 * Readable message from an Axios / API error response.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const msg = error?.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length) return String(msg[0]);
  if (error?.message === "Network Error") {
    return "Network error — check your connection and that the API is running.";
  }
  return fallback;
}
