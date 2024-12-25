import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  image: string;
  specialization: string;
  licenseNumber: number;
  experience: number;
  avaibility: boolean;
  visited_patients: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>("Doctor", DoctorSchema);
