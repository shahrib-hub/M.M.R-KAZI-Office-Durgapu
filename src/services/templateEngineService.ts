import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { buildTemplateSchema, extractPlaceholdersFromXml, TemplateField } from "../lib/templatePlaceholders.js";

const execFileAsync = promisify(execFile);

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const base = path.join(os.tmpdir(), `template-engine-${crypto.randomBytes(6).toString("hex")}`);
  await fs.mkdir(base, { recursive: true });
  try {
    return await fn(base);
  } finally {
    await fs.rm(base, { recursive: true, force: true });
  }
}

export async function analyzeTemplateFromBuffer(docxBuffer: Buffer): Promise<TemplateField[]> {
  return withTempDir(async (tmpDir) => {
    const templatePath = path.join(tmpDir, "template.docx");
    const extractedPath = path.join(tmpDir, "docx");

    await fs.writeFile(templatePath, docxBuffer);
    await fs.mkdir(extractedPath, { recursive: true });
    await execFileAsync("unzip", ["-q", templatePath, "-d", extractedPath]);

    const xmlFiles = [
      "word/document.xml",
      "word/header1.xml",
      "word/header2.xml",
      "word/footer1.xml",
      "word/footer2.xml"
    ];

    const placeholders = new Set<string>();
    for (const file of xmlFiles) {
      const filePath = path.join(extractedPath, file);
      try {
        const xml = await fs.readFile(filePath, "utf-8");
        extractPlaceholdersFromXml(xml).forEach((value) => placeholders.add(value));
      } catch {
        // Optional file (header/footer) can be absent.
      }
    }

    return buildTemplateSchema(Array.from(placeholders));
  });
}

export async function renderDocxFromBuffer(params: {
  templateBuffer: Buffer;
  payload: Record<string, string>;
}): Promise<Buffer> {
  return withTempDir(async (tmpDir) => {
    const templatePath = path.join(tmpDir, "input.docx");
    const extractedPath = path.join(tmpDir, "content");
    const outputPath = path.join(tmpDir, "output.docx");

    await fs.writeFile(templatePath, params.templateBuffer);
    await fs.mkdir(extractedPath, { recursive: true });
    await execFileAsync("unzip", ["-q", templatePath, "-d", extractedPath]);

    const xmlFiles = ["word/document.xml", "word/header1.xml", "word/header2.xml", "word/footer1.xml", "word/footer2.xml"];
    for (const xmlFile of xmlFiles) {
      const filePath = path.join(extractedPath, xmlFile);
      try {
        let xml = await fs.readFile(filePath, "utf-8");
        for (const [key, value] of Object.entries(params.payload)) {
          const replacement = (value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
          const re = new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*\\}\\}`, "g");
          xml = xml.replace(re, replacement);
        }
        await fs.writeFile(filePath, xml, "utf-8");
      } catch {
        // ignore missing optional xml files
      }
    }

    await execFileAsync("zip", ["-qr", outputPath, "."], { cwd: extractedPath });
    return fs.readFile(outputPath);
  });
}
