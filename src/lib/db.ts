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

// Use existing model if it exists to avoid overwrite errors
export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

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
