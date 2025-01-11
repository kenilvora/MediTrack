import mongoose, { Schema, Document } from "mongoose";

export interface ILabRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  testName: string;
  testResult: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabRecordSchema: Schema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testResult: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILabRecord>("LabRecord", LabRecordSchema);
