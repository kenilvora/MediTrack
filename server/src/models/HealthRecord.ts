import mongoose from "mongoose";

export interface IHealthRecord extends mongoose.Document {
  patient_id: mongoose.Types.ObjectId;
  disease: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disease: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HealthRecord", HealthRecordSchema);
