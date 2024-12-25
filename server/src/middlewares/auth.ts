import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

type UserPayload = {
  id: string;
  role: string;
};

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;

    if (!payload || !payload.id || !payload.role) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const user = await User.findById(payload.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

export const isPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "Patient") {
      res.status(403).json({
        success: false,
        message: "Forbidden Access",
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

export const isDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "Doctor") {
      res.status(403).json({
        success: false,
        message: "Forbidden Access",
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "Admin") {
      res.status(403).json({
        success: false,
        message: "Forbidden Access",
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};
