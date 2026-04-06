import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }
  },
  { timestamps: true }
);

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    mimeType: { type: String, required: true },
    schema: [
      {
        key: { type: String, required: true },
        type: { type: String, enum: ["text", "image", "date", "number"], required: true },
        label: { type: String, required: true },
        required: { type: Boolean, default: true }
      }
    ],
    status: { type: String, enum: ["active", "archived"], default: "active" },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }
  },
  { timestamps: true }
);

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    storagePath: { type: String, required: true },
    storageUrl: { type: String, required: true },
    schema: [
      {
        key: { type: String, required: true },
        type: { type: String, enum: ["text", "image", "date", "number"], required: true },
        label: { type: String, required: true },
        required: { type: Boolean, default: true }
      }
    ],
    status: { type: String, enum: ["active", "archived"], default: "active" },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

const generatedDocumentSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    templateName: { type: String, required: true },
    payload: { type: Object, required: true },
    docxPath: { type: String, required: true },
    pdfPath: { type: String, required: true },
    pdfUrl: { type: String, required: true }
  },
  { timestamps: true }
);

interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);
export const Template = (mongoose.models.Template as mongoose.Model<any>) || mongoose.model("Template", templateSchema);
export const GeneratedDocument =
  (mongoose.models.GeneratedDocument as mongoose.Model<any>) || mongoose.model("GeneratedDocument", generatedDocumentSchema);

const ADMINS = [
  {
    name: "Kazi Office",
    email: "kaziofficedurgapur@gmail.com",
    password: "Tousif@#2345"
  }
];

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) return cachedConnection;

  const conn = await mongoose.connect(MONGODB_URI);
  cachedConnection = conn;

  for (const admin of ADMINS) {
    const exists = await User.findOne({ email: admin.email });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await User.create({ ...admin, password: hashedPassword, role: "admin" });
    }
  }

  return conn;
}
