// signup
// login
// resetPasswordToken -> frontend url
// resetPassword -> reset password
// getme
// logout

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/User";
import dns from "dns";
import Otp from "../models/Otp";
import Patient from "../models/Patient";
import Doctor from "../models/Doctor";
import otpGenerator from "otp-generator";

const signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  phone_number: z.string().min(10),
  age: z.number().max(100),
  gender: z.enum(["Male", "Female", "Other"]),
  role: z.enum(["Patient", "Doctor", "Admin"]),
  otp: z.number().min(100000).max(999999),
});

const otpSchema = z.object({
  email: z.string().email(),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const parsedData = signupSchema.safeParse(req.body);

    // data validation
    if (!parsedData.success) {
      res.status(400).json({ message: "Invalid data." });
      return;
    }

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone_number,
      age,
      gender,
      role,
      otp,
    } = parsedData.data;

    // email validation
    const domain = email.split("@")[1];

    dns.resolveMx(domain, async (err, addresses) => {
      if (err || addresses.length === 0) {
        res.status(400).json({ message: "Invalid email address." });
        return;
      }

      // password validation
      if (password !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match." });
        return;
      }

      // check if user already exists
      const user = await User.findOne({
        email,
      });

      if (user) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const recentOtp = await Otp.findOne({
        email: email,
      })
        .sort({ createdAt: -1 }) // latest otp
        .limit(1);

      // otp validation
      if (!recentOtp || recentOtp.otp !== otp) {
        res.status(400).json({ message: "Invalid OTP." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let profileId;

      // create profile based on role
      if (role === "Patient") {
        profileId = await Patient.create({
          date_of_birth: null,
          image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
          address: "",
          blood_group: null,
          appointments: [],
          feedbacks: [],
          visited_doctors: [],
          health_records: [],
          lab_reports: [],
          prescriptions: [],
        });
      } else if (role === "Doctor") {
        profileId = await Doctor.create({
          image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
          specialization: [],
          licenseNumber: null,
          experience: null,
          availability: null,
          visited_patients: [],
          appointments: [],
          feedbacks: [],
        });
      }

      // create user
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone_number,
        profileId,
        age,
        gender,
        role,
      });

      res
        .status(201)
        .json({ success: true, message: "User created successfully." });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const sentOtp = async (req: Request, res: Response) => {
  try {
    const parsedData = otpSchema.safeParse(req.body);

    // data validation
    if (!parsedData.success) {
      res.status(400).json({ message: "Invalid data." });
      return;
    }

    const { email } = parsedData.data;

    // email validation
    const domain = email.split("@")[1];

    dns.resolveMx(domain, async (err, addresses) => {
      if (err || addresses.length === 0) {
        res.status(400).json({ message: "Invalid email address." });
        return;
      }

      // check if user already exists
      const user = await User.findOne({
        email,
      });

      if (user) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      let otp = otpGenerator.generate(6, {
        digits: true,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
      });

      let result = await Otp.findOne({
        otp,
      });

      while (result) {
        otp = otpGenerator.generate(6, {
          digits: true,
          specialChars: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
        });

        result = await Otp.findOne({
          otp,
        });
      }

      await Otp.create({
        email,
        otp,
      });

      res
        .status(200)
        .json({ success: true, message: "OTP sent successfully." });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
