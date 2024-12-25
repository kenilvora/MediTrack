import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  image: string;
  specialization: mongoose.Types.ObjectId[];
  licenseNumber: number;
  experience: number;
  availability: boolean;
  visited_patients: mongoose.Types.ObjectId[];
  appointments: mongoose.Types.ObjectId[];
  feedbacks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    specialization: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialization",
        required: true,
      },
    ],
    licenseNumber: {
      type: Number,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      required: true,
    },
    visited_patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>("Doctor", DoctorSchema);
