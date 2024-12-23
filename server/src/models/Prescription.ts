import mongoose, { Schema, Document } from "mongoose";

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  medication: string;
  dosage: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Doctor", required: true 
    },
    appointmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Appointment", required: true 
    },
    medication: { 
        type: String, 
        required: true 
    },
    dosage: { 
        type: String, 
        required: true 
    },
  },
   {    
    timestamps: true 
   }
);

export const Prescription = mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
