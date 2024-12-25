import { Request, Response } from "express";
import Doctor from "../models/Doctor";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";

// Update Doctor Profile
export const updateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { specialization, licenseNumber, experience, availability } =
      req.body;

    const id = req.user?.id;

    if (
      !specialization ||
      !licenseNumber ||
      !experience ||
      availability === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
      return;
    }

    const user = await User.findById(id);

    const profileId = user?.profileId;

    await Doctor.findByIdAndUpdate(
      profileId,
      {
        specialization,
        licenseNumber,
        experience,
        availability,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

// Update Doctor Profile Image
export const updateDoctorProfileImage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
  } catch (err) {}
};

// Get all doctors
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || "";

    const doctors = await User.find({
      role: "Doctor",
      $or: [
        {
          firstName: {
            $regex: filter,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: filter,
            $options: "i",
          },
        },
      ],
    })
      .select("-password")
      .populate("profileId");

    res.status(200).json({
      success: true,
      data: doctors,
      message: "All Doctors retrieved successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

// Get doctor by id
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" })
      .select("-password")
      .populate("profileId");

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: doctor,
      message: "Doctor retrieved successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

// Get Me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" })
      .select("-password")
      .populate("profileId");

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: doctor,
      message: "Doctor retrieved successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

// Get doctor by specialization
export const getDoctorBySpecialization = async (
  req: Request,
  res: Response
) => {
  try {
    const specialization = req.params.specialization;

    const doctors = await User.find({
      role: "Doctor",
    })
      .select("-password")
      .populate({
        path: "profileId",
        match: { specialization },
      });

    res.status(200).json({
      success: true,
      data: doctors,
      message: "Doctors retrieved successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};

// Get doctor by availability
export const getDoctorByAvailability = async (req: Request, res: Response) => {
  try {
    const availability = req.params.availability;

    const doctors = await User.find({
      role: "Doctor",
    })
      .select("-password")
      .populate({
        path: "profileId",
        match: { availability },
      });

    res.status(200).json({
      success: true,
      data: doctors,
      message: "Doctors retrieved successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
};
