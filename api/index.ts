import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB, GeneratedDocument, ManualPdf, Template, User } from "../src/lib/db.js";
import { analyzeTemplateFromBuffer, renderDocxFromBuffer } from "../src/services/templateEngineService.js";
import { buildTemplateSchema } from "../src/lib/templatePlaceholders.js";
import { downloadMongoFile, uploadBase64ToMongoFile } from "../src/services/mongoFileService.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

const TEST_PLACEHOLDERS = [
  "app_no",
  "husband_name",
  "husband_father",
  "husband_address",
  "wife_name",
  "wife_father",
  "wife_address",
  "divorce_date",
  "mehar",
  "condition",
  "witness1",
  "witness2",
  "photo",
  "signature",
  "registrar_signature"
];

app.use(express.json({ limit: "40mb" }));

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(500).json({ message: "Database connection failed" });
  }
});

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = extractCookie(req.headers.cookie, "token");
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function extractCookie(cookieHeader: string | undefined, key: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === key) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/me", requireAuth, async (req, res) => {
  const user = await User.findById((req as any).user.id).select("-password");
  res.json({ user });
});

app.post("/api/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.post("/api/templates/manual-upload", requireAuth, async (req, res) => {
  try {
    const { name, fileBase64, mimeType, useTestPlaceholders } = req.body;
    if (!name || !fileBase64 || !mimeType?.includes("wordprocessingml")) {
      return res.status(400).json({ message: "A DOCX template is required" });
    }

    const templateBuffer = Buffer.from(fileBase64, "base64");
    const schema = useTestPlaceholders
      ? buildTemplateSchema(TEST_PLACEHOLDERS)
      : await analyzeTemplateFromBuffer(templateBuffer).catch(() => buildTemplateSchema(TEST_PLACEHOLDERS));

    const fileId = await uploadBase64ToMongoFile({
      fileBase64,
      filename: `${name}.docx`,
      mimeType,
      metadata: { kind: "template", uploadedBy: (req as any).user.email }
    });

    const created = await Template.create({
      name,
      fileId,
      mimeType,
      schema,
      createdBy: (req as any).user.email
    });

    res.json({ template: created });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Template upload failed" });
  }
});

app.get("/api/templates", requireAuth, async (_req, res) => {
  const templates = await Template.find({ status: "active" }).sort({ createdAt: -1 });
  res.json({ templates });
});

app.get("/api/templates/:id/file", requireAuth, async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (!template) return res.status(404).json({ message: "Template not found" });

  const file = await downloadMongoFile(String(template.fileId));
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${template.name}.docx"`);
  res.send(file.buffer);
});

app.post("/api/documents/generate", requireAuth, async (req, res) => {
  try {
    const { templateId, fields } = req.body;
    if (!templateId || !fields || typeof fields !== "object") {
      return res.status(400).json({ message: "templateId and fields are required" });
    }

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found" });

    const missingRequired = template.schema
      .filter((field: any) => field.required && !fields[field.key])
      .map((field: any) => field.key);
    if (missingRequired.length) {
      return res.status(400).json({ message: `Missing required fields: ${missingRequired.join(", ")}` });
    }

    const payload: Record<string, string> = {};
    for (const field of template.schema) {
      if (field.type === "image") {
        const image = fields[field.key];
        if (!image?.base64) return res.status(400).json({ message: `Missing image for ${field.key}` });
        payload[field.key] = `[image:${field.key}]`;
      } else {
        payload[field.key] = String(fields[field.key] ?? "");
      }
    }

    const templateFile = await downloadMongoFile(String(template.fileId));
    const renderedDocxBuffer = await renderDocxFromBuffer({ templateBuffer: templateFile.buffer, payload });

    const fileId = await uploadBase64ToMongoFile({
      fileBase64: renderedDocxBuffer.toString("base64"),
      filename: `${template.name}-generated.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      metadata: { kind: "generated-docx", templateId: String(template._id) }
    });

    const generated = await GeneratedDocument.create({
      templateId: template._id,
      templateName: template.name,
      payload,
      fileId
    });

    res.json({
      document: generated,
      docxUrl: `/api/documents/${generated._id}/docx`,
      message: "Generated and stored in MongoDB GridFS"
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Document generation failed" });
  }
});

app.get("/api/documents", requireAuth, async (_req, res) => {
  const documents = await GeneratedDocument.find().sort({ createdAt: -1 }).limit(100).select("templateName createdAt");
  res.json({
    documents: documents.map((doc: any) => ({
      _id: doc._id,
      templateName: doc.templateName,
      createdAt: doc.createdAt,
      docxUrl: `/api/documents/${doc._id}/docx`
    }))
  });
});

app.get("/api/documents/:id/docx", requireAuth, async (req, res) => {
  const document = await GeneratedDocument.findById(req.params.id);
  if (!document) return res.status(404).json({ message: "Document not found" });

  const file = await downloadMongoFile(String(document.fileId));
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${document.templateName}-generated.docx"`);
  res.send(file.buffer);
});

app.post("/api/manual-pdfs/upload", requireAuth, async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName?.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({ message: "Only PDF files are accepted" });
    }

    const fileId = await uploadBase64ToMongoFile({
      fileBase64,
      filename: fileName,
      mimeType: "application/pdf",
      metadata: { kind: "manual-pdf", uploadedBy: (req as any).user.email }
    });

    const created = await ManualPdf.create({
      name: fileName,
      fileId,
      uploadedBy: (req as any).user.email
    });

    res.json({
      pdf: {
        _id: created._id,
        name: created.name,
        url: `/api/manual-pdfs/${created._id}/file`
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Manual PDF upload failed" });
  }
});

app.get("/api/manual-pdfs", requireAuth, async (_req, res) => {
  const pdfs = await ManualPdf.find().sort({ createdAt: -1 });
  res.json({
    pdfs: pdfs.map((pdf: any) => ({
      _id: pdf._id,
      name: pdf.name,
      url: `/api/manual-pdfs/${pdf._id}/file`
    }))
  });
});

app.get("/api/manual-pdfs/:id/file", requireAuth, async (req, res) => {
  const pdf = await ManualPdf.findById(req.params.id);
  if (!pdf) return res.status(404).json({ message: "PDF not found" });

  const file = await downloadMongoFile(String(pdf.fileId));
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${pdf.name}"`);
  res.send(file.buffer);
});

export default app;
