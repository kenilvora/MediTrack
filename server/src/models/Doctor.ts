import mongoose, {Schema, Document} from "mongoose";

export interface IDoctor extends Document {
    userId: mongoose.Types.ObjectId;
    specialization: string;
    licenseNumber: number;
    experience: number;
    avaibility: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
    },
    {
        timestamps: true
    }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema);