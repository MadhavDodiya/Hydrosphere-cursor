## 2024-04-26 - Add .lean() to read-only queries
**Learning:** Found multiple instances where Mongoose `.find()` queries were used for read-only responses without `.lean()`, unnecessarily hydrating full Mongoose documents and adding memory/processing overhead.
**Action:** Always append `.lean()` to Mongoose queries when the data is only used for read-only operations (like sending JSON or aggregating IDs).
