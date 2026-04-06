# Muhammadan Marriage & Divorce Registrar — Admin (MongoDB-first Test Flow)

Current implementation is simplified for testing on Vercel constraints:

- Manual DOCX template upload to **MongoDB** (base64 stored in DB).
- Optional **test placeholder schema** toggle during upload.
- Dynamic form generation from stored schema.
- Generate filled DOCX and save generated output in MongoDB.
- Manual PDF upload to MongoDB (not backend filesystem).

## API modules

- `api/index.ts` -> auth + templates + documents + manual-pdf APIs
- `src/lib/db.ts` -> Mongo models (`Template`, `GeneratedDocument`, `ManualPdf`)
- `src/services/templateEngineService.ts` -> DOCX placeholder parse/render logic
- `src/web/admin/` -> dedicated admin web workspace UI

## Notes

- No local `storage/` bucket dependency is used anymore.
- Files are served directly from MongoDB-backed APIs.
- `useTestPlaceholders` is available for testing until all templates are uploaded and verified.
