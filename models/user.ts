import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: "seeker" | "employer";
  department: string;
  skills?: string[];
  resumeURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, enum: ["seeker", "employer"]},
    department: { type: String },
    skills: [{ type: String }],
    resumeURL: { type: String },
  },
  { timestamps: true }
);

// ✅ Fix for Turbopack & Middleware
// In some cases, `mongoose.models` can be undefined early in app startup
const models = mongoose.models || {}; 

const User: Model<IUser> = 
  models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
