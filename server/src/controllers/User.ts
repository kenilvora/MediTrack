// signup -> done
// sentOtp -> done
// login
// resetPasswordToken -> frontend url
// resetPassword -> reset password
// getme
// logout

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import User from "../models/User";
import dns from "dns";
import Otp from "../models/Otp";
import Patient from "../models/Patient";
import Doctor from "../models/Doctor";
import otpGenerator from "otp-generator";
import { AuthRequest } from "../middlewares/auth";
import mailSender from "../utils/mailSender";
import {resetPasswordTokenTemplate} from "../mails/resetPasswordTokenTemplate";

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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resetPasswordTokenSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = loginSchema.safeParse(req.body);

    if(!parsedData.success){
      res.status(400).json({success: false, message: "Invalid data"});
      return;
    }

    const { email, password } = parsedData.data;
    
    const domain = email.split("@")[1];
      

    dns.resolveMx(domain, async (err, addresses) => {
      if (err || addresses.length === 0) {
        res.status(400).json({ message: "Invalid email address." });
        return;
      }
  
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ success: false, message: "User does not exist" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ success: false, message: "Invalid Password" });
        return;
      }

      const payload = {
        userId: user._id,
        role: user.role,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET as string);

      res.cookie("token", token, {
        secure: true,
        sameSite: "lax",
        maxAge: 31536000000,
      })

      res.status(200).json({ 
        success: true, 
        token,
        message: "Logged in Successfully"
      });
    });
  }
  catch(error){
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const resetPasswordToken = async(req: Request, res: Response):Promise<void>=>{
  try{
    const parsedData = resetPasswordTokenSchema.safeParse(req.body);

    if(!parsedData.success){
      res.status(400).json({success: false, message: "Invalid data"});
      return;
    }

    const { email } = parsedData.data;
    
    const domain = email.split("@")[1];

    dns.resolveMx(domain, async (err, addresses) => {
      if (err || addresses.length === 0) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const user = await User.findOne({email});

      if(!user){
        res.status(404).json({success: false, message: "User does not exist"});
        return;
      }
      
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");  

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;

      try{
        const name = `${user.firstName} ${user.lastName}`;

        await mailSender(
          email,
          "Reset Your Password",
          resetPasswordTokenTemplate(resetUrl, name)
        );
      } catch(error){
        res.status(500).json({ success: false, message: "Failes to send email" });
      }

      res.status(200).json({ success: true, message: "Reset Password Token sent successfully" });
    });
  } catch(error){
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const resetPassword = async(req: Request, res: Response):Promise<void>=>{
  try{
    const token = req.params.token;

    const parsedData = resetPasswordSchema.safeParse(req.body);

    if(!parsedData.success){
      res.status(400).json({success: false, message: "Invalid data"});
      return;
    }

    const { password, confirmPassword } = parsedData.data;

    if(password !== confirmPassword){
      res.status(400).json({success: false, message: "Passwords do not match"});
      return;
    }

    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user){
      res.status(400).json({success: false, message: "Invalid Token"});
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch(error){
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const logOut = async(req: Request, res: Response):Promise<void>=>{
  try{
    res.clearCookie("token", {
      secure: true,
      sameSite: "lax",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch(error){
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select:
        req.user?.role === "Doctor"
          ? "-visited_patients -appointments -feedbacks"
          : "-appointments -feedbacks visited_doctors health_records lab_reports prescriptions",
      })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
      
    }
    return res.status(200).json({ success: true, user, message: "Data fetched successfully" });
  } catch (error) { 
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}