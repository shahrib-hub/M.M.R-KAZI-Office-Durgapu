import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { connectDB, GeneratedDocument, Template, User } from "../src/lib/db.js";
import { analyzeTemplateFromBuffer, renderDocxFromBuffer } from "../src/services/templateEngineService.js";
import { readFileBuffer, resolveStoragePath, saveBase64File } from "../src/services/storageService.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-kazi-key";

app.use(express.json({ limit: "30mb" }));
app.use(cookieParser());

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(500).json({ message: "Database connection failed" });
  }
});

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
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

app.post("/api/templates/upload", requireAuth, async (req, res) => {
  try {
    const { name, fileBase64, mimeType } = req.body;
    if (!name || !fileBase64 || !mimeType?.includes("wordprocessingml")) {
      return res.status(400).json({ message: "A DOCX file is required" });
    }

    const templateBuffer = Buffer.from(fileBase64, "base64");
    const schema = await analyzeTemplateFromBuffer(templateBuffer);
    if (!schema.length) {
      return res.status(400).json({ message: "No placeholders found. Use {{field_name}} format." });
    }

    const saved = await saveBase64File({
      base64: fileBase64,
      kind: "templates",
      mimeType,
      suggestedName: name
    });

    const created = await Template.create({
      name,
      storagePath: saved.relativePath,
      storageUrl: saved.publicUrl,
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

app.post("/api/documents/generate", requireAuth, async (req, res) => {
  try {
    const { templateId, fields } = req.body;
    if (!templateId || !fields || typeof fields !== "object") {
      return res.status(400).json({ message: "templateId and fields are required" });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

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
        if (!image?.base64 || !image?.mimeType?.startsWith("image/")) {
          return res.status(400).json({ message: `Invalid image payload for ${field.key}` });
        }

        const imageSaved = await saveBase64File({
          base64: image.base64,
          kind: "image-assets",
          mimeType: image.mimeType,
          suggestedName: field.key
        });

        payload[field.key] = imageSaved.publicUrl;
      } else {
        payload[field.key] = String(fields[field.key] ?? "");
      }
    }

    const templateBuffer = await readFileBuffer(template.storagePath);
    const renderedDocxBuffer = await renderDocxFromBuffer({ templateBuffer, payload });

    const docxSaved = await saveBase64File({
      base64: renderedDocxBuffer.toString("base64"),
      kind: "templates",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      suggestedName: `${template.name}-filled`
    });

    const generated = await GeneratedDocument.create({
      templateId: template._id,
      templateName: template.name,
      payload,
      docxPath: docxSaved.relativePath,
      docxUrl: docxSaved.publicUrl,
      pdfPath: "",
      pdfUrl: ""
    });

    res.json({
      document: generated,
      docxUrl: docxSaved.publicUrl,
      message: "DOCX generated successfully. Upload PDF manually if needed."
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Document generation failed" });
  }
});

app.get("/api/documents", requireAuth, async (_req, res) => {
  const documents = await GeneratedDocument.find().sort({ createdAt: -1 }).limit(100);
  res.json({ documents });
});

app.post("/api/manual-pdfs/upload", requireAuth, async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName?.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({ message: "Only PDF files are accepted" });
    }

    const saved = await saveBase64File({
      base64: fileBase64,
      kind: "manual-pdf-uploads",
      mimeType: "application/pdf",
      suggestedName: fileName.replace(/\.pdf$/i, "")
    });

    res.json({ file: saved });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Manual PDF upload failed" });
  }
});

app.get("/api/manual-pdfs", requireAuth, async (_req, res) => {
  const dir = path.join(process.cwd(), "storage", "manual-pdf-uploads");
  await fs.mkdir(dir, { recursive: true });
  const files = await fs.readdir(dir);
  const pdfs = files
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((fileName) => ({
      name: fileName,
      url: `/api/storage/manual-pdf-uploads/${fileName}`
    }));

  res.json({ pdfs });
});

app.get("/api/storage/:kind/:fileName", async (req, res) => {
  try {
    const kind = req.params.kind as any;
    const fileName = req.params.fileName;
    const safe = fileName.replace(/[\\/]/g, "");
    const filePath = resolveStoragePath(kind, safe);

    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === ".pdf"
      ? "application/pdf"
      : ext === ".docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : ext === ".png"
          ? "image/png"
          : "image/jpeg";

    res.setHeader("Content-Type", mime);
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});

export default app;
