
## 2024-04-26 - Centralized Regex Escaping for NoSQL Injection Prevention
**Vulnerability:** User input was directly passed to MongoDB `$regex` queries in `adminController.js`, leading to potential ReDoS and NoSQL Injection vulnerabilities.
**Learning:** The `escapeRegex` utility was defined locally in `listingController.js`, missing an opportunity to reuse it across the application for sanitizing all search inputs used in `$regex`.
**Prevention:** Always extract and use the shared `escapeRegex` utility from `backend/utils/regex.js` before embedding any user-provided string directly into a MongoDB `$regex` clause.
