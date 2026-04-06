import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { connectDB, User, Template, Appointment } from "../src/lib/db.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-kazi-key";

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Connect to DB for every request (cached in lib/db.ts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// API Routes
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// --- Template Routes ---

// Upload a template
app.post("/api/templates", async (req, res) => {
  console.log("Cookies received in /api/templates:", req.cookies);
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const { name, data } = req.body;
    if (!name || !data) return res.status(400).json({ message: "Name and data are required" });

    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      existingTemplate.data = data;
      await existingTemplate.save();
      return res.json({ message: "Template updated successfully", template: existingTemplate });
    }

    const template = new Template({ name, data });
    await template.save();
    res.status(201).json({ message: "Template created successfully", template });
  } catch (err) {
    console.error("Template upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List templates
app.get("/api/templates", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const templates = await Template.find().select("-data"); // Don't send large base64 data in list
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Generate document from template
app.post("/api/templates/:id/generate", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    const { data } = req.body; // The data to fill in the placeholders

    // Decode base64 template
    const base64Data = template.data.replace(/^data:.*?;base64,/, "");
    const content = Buffer.from(base64Data, "base64");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Render the document
    doc.render(data);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    res.setHeader("Content-Disposition", `attachment; filename=generated_${template.name}.docx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buf);
  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).json({ message: "Error generating document" });
  }
});

// --- Appointment Routes ---

// Create appointment (Public)
app.post("/api/appointments", async (req, res) => {
  try {
    const { name, phone, service, date, time, message } = req.body;
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const appointment = new Appointment({
      name, phone, service, date, time, message
    });
    await appointment.save();
    
    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    console.error("Appointment creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointments (Admin only)
app.get("/api/appointments", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark appointment as read (Admin only)
app.patch("/api/appointments/:id/read", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Marked as read", appointment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update appointment status (Admin only)
app.patch("/api/appointments/:id/status", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// For Vercel serverless function
export default app;
