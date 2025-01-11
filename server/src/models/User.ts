import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone_number: string;
  profileId?: mongoose.Types.ObjectId;
  age: number;
  gender: "Male" | "Female" | "Other";
  role: "Patient" | "Doctor" | "Admin";
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "role",
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    role: {
      type: String,
      required: true,
      enum: ["Patient", "Doctor", "Admin"],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (this.role === "Admin") {
    this.profileId = undefined;
  }
});

export default mongoose.model<IUser>("User", UserSchema);
