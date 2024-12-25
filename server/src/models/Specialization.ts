import mongoose from "mongoose";

export interface ISpecialization extends mongoose.Document {
  name: string;
}

const SpecializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export default mongoose.model<ISpecialization>(
  "Specialization",
  SpecializationSchema
);
