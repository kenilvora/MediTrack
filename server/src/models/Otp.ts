import mongoose from "mongoose";
import mailSender from "../utils/mailSender";
import { otpTemplate } from "../mails/emailVerificationTemplate";

export interface IOtp extends mongoose.Document {
  otp: number;
  email: string;
  expiresAt: Date;
}

const OtpSchema = new mongoose.Schema(
  {
    otp: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic deletion
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

async function sendOtp(email: string, otp: number) {
  try {
    await mailSender(email, "Verification Code", otpTemplate(otp));
  } catch (err) {
    console.error(err);
    throw new Error("Error sending OTP");
  }
}

OtpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendOtp(this.email, this.otp);
  }
  next();
});

export default mongoose.model<IOtp>("Otp", OtpSchema);
