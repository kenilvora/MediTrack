import express from "express";
import {
  getMe,
  login,
  logOut,
  resetPassword,
  resetPasswordToken,
  sentOtp,
  signUp,
} from "../controllers/User";
import { auth } from "../middlewares/auth";

const router = express.Router();

// Signup Route
router.post("/signup", signUp);

// Login Route
router.post("/login", login);

// Send OTP Route
router.post("/sendOtp", sentOtp);

// Logout Route
router.get("/logout", auth, logOut);

// Reset Password Token Route
router.post("/resetPasswordToken", resetPasswordToken);

// Reset Password Route
router.post("/forgotPassword", resetPassword);

// Get Me Route
router.get("/me", auth, getMe);

export default router;
