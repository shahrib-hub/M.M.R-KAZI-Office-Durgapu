export type FieldType = "text" | "image" | "date" | "number";

export interface TemplateField {
  key: string;
  type: FieldType;
  label: string;
  required: boolean;
}

const IMAGE_HINTS = ["photo", "signature", "sign", "thumb", "stamp", "seal", "logo", "image"];
const DATE_HINTS = ["date", "dob", "issued_at", "divorce_date"];
const NUMBER_HINTS = ["amount", "no", "number", "count", "total", "mehar"];

export function extractPlaceholdersFromXml(xml: string): string[] {
  const matches = xml.match(/\{\{\s*([a-zA-Z0-9_\-.]+)\s*\}\}/g) ?? [];
  return Array.from(
    new Set(matches.map((m) => m.replace(/[{}\s]/g, "")))
  );
}

function inferFieldType(key: string): FieldType {
  const normalized = key.toLowerCase();
  if (IMAGE_HINTS.some((hint) => normalized.includes(hint))) return "image";
  if (DATE_HINTS.some((hint) => normalized.includes(hint))) return "date";
  if (NUMBER_HINTS.some((hint) => normalized.includes(hint))) return "number";
  return "text";
}

function createLabel(key: string): string {
  return key
    .replace(/[_\-.]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildTemplateSchema(placeholders: string[]): TemplateField[] {
  return placeholders.map((key) => ({
    key,
    type: inferFieldType(key),
    label: createLabel(key),
    required: true
  }));
}
