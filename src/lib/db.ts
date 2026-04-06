import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/kazi-office";

// MongoDB Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }
});

interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  data: { type: String, required: true }, // Base64 encoded docx file
  createdAt: { type: Date, default: Date.now }
});

export interface ITemplate {
  name: string;
  data: string;
  createdAt: Date;
}

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  message: { type: String },
  status: { type: String, default: 'Pending' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export interface IAppointment {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message?: string;
  status: string;
  isRead: boolean;
  createdAt: Date;
}

// Use existing model if it exists to avoid overwrite errors
export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);
export const Template = (mongoose.models.Template as mongoose.Model<ITemplate>) || mongoose.model<ITemplate>("Template", templateSchema);
export const Appointment = (mongoose.models.Appointment as mongoose.Model<IAppointment>) || mongoose.model<IAppointment>("Appointment", appointmentSchema);

// Predefined Admins
const ADMINS = [
  {
    name: "Kazi Office",
    email: "kaziofficedurgapur@gmail.com",
    password: "Tousif@#2345"
  },
  {
    name: "Tousif Ahamed",
    email: "ahamedtousif6290@gmail.com",
    password: "Tousif@#2345"
  }
];

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) return cachedConnection;

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    cachedConnection = conn;
    console.log("Connected to MongoDB");
    
    // Seed admins
    for (const admin of ADMINS) {
      const exists = await User.findOne({ email: admin.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await User.create({ ...admin, password: hashedPassword });
        console.log(`Admin seeded: ${admin.email}`);
      }
    }
    
    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
