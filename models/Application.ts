import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  seekerEmail: string;
  coverLetter?: string;
status: 'pending' | 'accepted' | 'rejected';
  location?: string;
  resumeURL?: string;
  createdAt: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seekerEmail: { type: String, required: true },
    coverLetter: { type: String },
     status:{
        type:String,
        enum:['pending', 'accepted','rejected'],
        default:'pending'
     },
    location: { type: String },
    resumeURL: { type: String },
  },
  { timestamps: true }
);

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
