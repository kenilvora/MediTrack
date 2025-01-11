import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  dateTime: Date;
  status: "confirmed" | "completed";
  disease: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "completed"],
      default: "confirmed",
      required: true,
    },
    disease: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
