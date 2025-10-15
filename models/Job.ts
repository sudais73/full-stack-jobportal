import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  skills: string[];
  location: string;
  salaryRange: string;
  jobType: "onsite" | "remote" | "contract";
  employerId: mongoose.Types.ObjectId;
  applicantsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: { type: [String], required: true },
    location: { type: String, required: true },
    salaryRange: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["onsite", "remote", "contract"],
      required: true,
    },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
