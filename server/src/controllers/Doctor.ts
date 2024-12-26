import { Request, Response } from "express";
import Doctor from "../models/Doctor";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";

// Update Doctor Profile
export const updateDoctorProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let { specialization, licenseNumber, experience, availability } = req.body;

    const id = req.user?.id;

    if (!specialization && !licenseNumber && !experience && !availability) {
      res.status(400).json({
        success: false,
        message: "Please provide data to update",
      });
      return;
    }

    const user = await User.findById(id);

    const profileId = user?.profileId;

    const doctor = await Doctor.findById(profileId);

    licenseNumber = licenseNumber || doctor?.licenseNumber;
    experience = experience || doctor?.experience;
    availability = availability || doctor?.availability;
    let oldSpecialization = doctor?.specialization || [];

    if (specialization) {
      oldSpecialization.push(specialization);
    }

    await Doctor.findByIdAndUpdate(
      profileId,
      {
        licenseNumber,
        experience,
        availability,
        specialization: oldSpecialization,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all doctors : public
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || "";

    const { page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const doctors = await User.aggregate([
      {
        $match: {
          role: "Doctor",
          $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "Doctor", 
          localField: "profileId",
          foreignField: "_id",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      {
        $addFields: {
          visited_patients_count: {
            $size: { $ifNull: ["$profile.visited_patients", []] },
          },
          feedbacks_count: { $size: { $ifNull: ["$profile.feedbacks", []] } },
        },
      },
      {
        $project: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpire: 0,
          "profile.visited_patients": 0,
          "profile.appointments": 0,
          "profile.feedbacks": 0,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: doctors,
      message: "All Doctors retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get doctor by id
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" })
      .select("-password")
      .populate({
        path: "profileId",
        populate: {
          path: "specialization",
          select: "name",
        },
        select: "-visited_patients",
      });

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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" })
      .select("-password")
      .populate({
        path: "profileId",
        populate: {
          path: "specialization",
          select: "name",
        },
        select: "-visited_patients",
      });

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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
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
        populate: {
          path: "specialization",
          match: { name: specialization },
        },
        select: "-visited_patients",
      });

    res.status(200).json({
      success: true,
      data: doctors,
      message: "Doctors retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
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
        select: "-visited_patients",
        populate: {
          path: "specialization",
          select: "name",
        },
      });

    res.status(200).json({
      success: true,
      data: doctors,
      message: "Doctors retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get doctor by experience
export const getDoctorByExperience = async (req: Request, res: Response) => {
  try {
    const experience = req.params.experience;

    const doctors = await User.find({
      role: "Doctor",
    })
      .select("-password")
      .populate({
        path: "profileId",
        match: { experience },
        select: "-visited_patients",
        populate: {
          path: "specialization",
          select: "name",
        },
      });

    res.status(200).json({
      success: true,      
      data: doctors,
      message: "Doctors retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Patients Under A Doctor
export const getAllPatientsUnderDoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.user?.role === "Doctor" ? req.user.id : req.params.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    const patients = await User.findById(id)
      .select("-password")
      .populate({
        path: "profileId",
        populate: {
          path: "visited_patients",
          select: "firstName lastName email phone_number",
        },
        select: "visited_patients",
      });

    res.status(200).json({
      success: true,
      data: patients,
      message: "Patients retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
