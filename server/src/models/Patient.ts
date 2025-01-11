import mongoose from "mongoose";

export interface IPatient extends mongoose.Document {
  date_of_birth: Date;
  address: string;
  blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  appointments: mongoose.Types.ObjectId[];
  image: string;
  feedbacks: mongoose.Types.ObjectId[];
  visited_doctors: mongoose.Types.ObjectId[];
  health_record: mongoose.Types.ObjectId;
  lab_reports: mongoose.Types.ObjectId[];
  prescriptions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// GetAllAppointments : 1 : id ? req.user.role === admin ? id = req.params.id : req.user.role == patinent ? id = req.user.id   -> login -> req.user.id -> user -> profileId : patient : req.user.id, admin : params

const PatientSchema = new mongoose.Schema(
  {
    date_of_birth: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
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
        ref: "User",
      },
    ],
    health_record: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthRecord",
    },
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
