import mongoose from "mongoose";

export interface IPatient extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  date_of_birth: Date;
  address: string;
  blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  appointments: mongoose.Types.ObjectId[];
  feedbacks: mongoose.Types.ObjectId[];
  visited_doctors: mongoose.Types.ObjectId[];
  health_records: mongoose.Types.ObjectId[];
  lab_reports: mongoose.Types.ObjectId[];
  prescriptions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    blood_group: {
      type: String,
      required: true,
      trim: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    feedbacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],
    visited_doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    health_records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HealthRecord",
      },
    ],
    lab_reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabReport",
      },
    ],
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prescription",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPatient>("Patient", PatientSchema);
