# Muhammadan Marriage & Divorce Registrar — Production Admin Automation

This project now includes a production-ready admin document automation workflow:

- Upload DOCX templates with `{{placeholder}}` fields.
- Auto-detect required fields and infer input types.
- Generate dynamic forms from template schema.
- Fill DOCX templates from admin input.
- Convert DOCX to PDF via CloudConvert API (Vercel-compatible).
- Store and preview generated PDFs.
- Upload manual PDFs into backend folder (`storage/manual-pdf-uploads`).

## Architecture

- `api/` → Auth + template/document API endpoints
- `src/lib/` → DB + placeholder/schema logic
- `src/services/` → template rendering, conversion, storage services
- `src/components/` → production admin UI

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment in `.env` using `.env.example`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDCONVERT_API_KEY`
3. Run locally:
   ```bash
   npm run dev
   ```

## Important Notes

- Placeholder mapping is **only** placeholder-driven (`{{field_key}}`), no hardcoded coordinates.
- Image placeholders are currently validated and stored; fill output uses text replacement strategy suitable for URL/path insertion.
- For production image embedding in DOCX, connect `docxtemplater + image module` in `src/services/templateEngineService.ts`.
