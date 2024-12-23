import mongoose, { Schema, Document } from "mongoose";

export interface ILabRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  filePath: string;
  testName: string;
  testResult: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabRecordSchema: Schema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    filePath: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

export const LabRecord = mongoose.model<ILabRecord>(
  "LabRecord",
  LabRecordSchema
);
