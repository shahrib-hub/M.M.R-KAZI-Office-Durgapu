# Muhammadan Marriage & Divorce Registrar — Admin (MongoDB-only File Storage)

This version stores uploaded files in MongoDB GridFS (no filesystem writes), which fixes Vercel `EROFS` errors.

## Current test flow

- Manual DOCX template upload to MongoDB GridFS.
- Optional **test placeholder schema** toggle during template upload.
- Dynamic form generation from stored schema.
- Generate filled DOCX and store generated file in MongoDB GridFS.
- Manual PDF upload to MongoDB GridFS.

## Key locations

- `api/index.ts` -> auth + templates + documents + manual-pdf APIs
- `src/services/mongoFileService.ts` -> GridFS upload/download service
- `src/lib/db.ts` -> Mongo models
- `src/services/templateEngineService.ts` -> DOCX parse/render
- `src/web/admin/` -> dedicated admin workspace UI

## Why this fixes your issue

Vercel serverless runtime has read-only app filesystem (`/var/task`). This implementation writes files to MongoDB GridFS instead of any local path.
