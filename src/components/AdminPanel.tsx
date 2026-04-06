import { useEffect, useMemo, useState } from "react";
import { FilePlus2, FileText, Loader2, Upload, Eye, Download, ShieldCheck } from "lucide-react";

type FieldType = "text" | "image" | "date" | "number";

interface TemplateField {
  key: string;
  type: FieldType;
  label: string;
  required: boolean;
}

interface Template {
  _id: string;
  name: string;
  schema: TemplateField[];
  createdAt: string;
}

interface GeneratedDocument {
  _id: string;
  templateName: string;
  docxUrl: string;
  pdfUrl?: string;
  createdAt: string;
}

interface AdminPanelProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

async function toBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [templateUpload, setTemplateUpload] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [manualPdf, setManualPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template._id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  const loadData = async () => {
    const [templatesRes, docsRes] = await Promise.all([fetch("/api/templates"), fetch("/api/documents")]);
    const templatesJson = await templatesRes.json();
    const docsJson = await docsRes.json();

    setTemplates(templatesJson.templates || []);
    setDocuments(docsJson.documents || []);

    if (!selectedTemplateId && templatesJson.templates?.length) {
      setSelectedTemplateId(templatesJson.templates[0]._id);
    }
  };

  useEffect(() => {
    loadData().catch(() => setMessage("Failed to load admin data"));
  }, []);

  const handleTemplateUpload = async () => {
    if (!templateUpload || !templateName.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const fileBase64 = await toBase64(templateUpload);
      const res = await fetch("/api/templates/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          fileBase64,
          mimeType: templateUpload.type
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Template upload failed");

      setMessage("Template uploaded and analyzed successfully.");
      setTemplateUpload(null);
      setTemplateName("");
      await loadData();
    } catch (error: any) {
      setMessage(error.message || "Template upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    setMessage("");

    try {
      const payload: Record<string, any> = {};

      for (const field of selectedTemplate.schema) {
        const value = fieldValues[field.key];
        if (field.required && !value) {
          throw new Error(`${field.label} is required`);
        }

        if (field.type === "image" && value instanceof File) {
          payload[field.key] = {
            base64: await toBase64(value),
            mimeType: value.type,
            fileName: value.name
          };
        } else {
          payload[field.key] = value;
        }
      }

      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate._id, fields: payload })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Generation failed");

      setMessage("DOCX generated successfully.");
      setFieldValues({});
      await loadData();
    } catch (error: any) {
      setMessage(error.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualPdfUpload = async () => {
    if (!manualPdf) return;

    setLoading(true);
    try {
      const fileBase64 = await toBase64(manualPdf);
      const res = await fetch("/api/manual-pdfs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, fileName: manualPdf.name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Manual PDF upload failed");

      setMessage("Manual PDF uploaded to backend folder.");
      setManualPdf(null);
    } catch (error: any) {
      setMessage(error.message || "Manual PDF upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-700 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><ShieldCheck /> Registrar Document Automation</h1>
              <p className="text-emerald-100">Signed in as {user.name} ({user.email})</p>
            </div>
            <button onClick={onLogout} className="rounded-lg bg-white px-4 py-2 text-emerald-800 font-semibold hover:bg-emerald-50">Logout</button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><FilePlus2 className="w-5 h-5" /> Upload DOCX Template</h2>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setTemplateUpload(e.target.files?.[0] || null)} />
            <button disabled={loading || !templateUpload || !templateName.trim()} onClick={handleTemplateUpload} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload & Analyze
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Manual PDF Upload Folder</h2>
            <p className="text-sm text-slate-500">Uploads PDF files into backend folder: <code>storage/manual-pdf-uploads</code></p>
            <input type="file" accept="application/pdf" onChange={(e) => setManualPdf(e.target.files?.[0] || null)} />
            <button disabled={loading || !manualPdf} onClick={handleManualPdfUpload} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60">Upload PDF</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Generate Document</h2>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              setFieldValues({});
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="">Select Template</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>{template.name}</option>
            ))}
          </select>

          {selectedTemplate && (
            <div className="grid gap-4 md:grid-cols-2">
              {selectedTemplate.schema.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">{field.label} {field.required && <span className="text-red-600">*</span>}</label>
                  {field.type === "image" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.files?.[0] || null }))}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            disabled={loading || !selectedTemplate}
            onClick={handleGenerate}
            className="rounded-lg bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Generate DOCX"}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Generated Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Template</th>
                  <th className="py-2 pr-4">Created At</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium"><FileText className="inline w-4 h-4 mr-1" /> {doc.templateName}</td>
                    <td className="py-3 pr-4">{new Date(doc.createdAt).toLocaleString()}</td>
                    <td className="py-3 space-x-2">
                      {doc.pdfUrl ? (
                        <>
                          <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 hover:bg-slate-200"><Eye className="w-4 h-4" /> PDF Preview</a>
                          <a href={doc.pdfUrl} download className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-200"><Download className="w-4 h-4" /> PDF</a>
                        </>
                      ) : null}
                      <a href={doc.docxUrl} download className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-blue-800 hover:bg-blue-200"><Download className="w-4 h-4" /> DOCX</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {message && <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  );
}
