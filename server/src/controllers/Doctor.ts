import { Request, Response } from "express";
import Doctor from "../models/Doctor";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import { z } from "zod";
import { populate } from "dotenv";

interface DoctorProfile {
  _id: string;
  image: string;
  specialization: { _id: string; name: string }[];
  licenseNumber: string;
  experience: number;
  availability: string;
  visited_patients: string[];
  appointments: string[];
  feedbacks: string[];
}

const updateDoctorProfileSchema = z.object({
  specialization: z.array(z.string()).optional(),
  experience: z.number().optional(),
  availability: z.string().optional(),
});

// Update Doctor Profile
export const updateDoctorProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = updateDoctorProfileSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    let { specialization, experience, availability } = req.body;

    const id = req.user?.id;

    const user = await User.findById(id);

    const profileId = user?.profileId;

    const doctor = await Doctor.findById(profileId);

    experience = experience || doctor?.experience;
    availability = availability || doctor?.availability;
    specialization = specialization || doctor?.specialization;

    await Doctor.findByIdAndUpdate(
      profileId,
      {
        experience,
        availability,
        specialization,
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

// Get all doctors
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
        $lookup: {
          from: "Specialization",
          localField: "profile.specialization",
          foreignField: "_id",
          as: "profile.specialization",
        },
      },
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

    const doctorData = await User.findOne({ _id: id, role: "Doctor" })
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        populate: {
          path: "specialization",
          select: "name",
        },
      });

    if (!doctorData) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    let doctor;

    if (doctorData && doctorData.profileId) {
      const profile = doctorData.profileId as unknown as DoctorProfile;
      doctor = {
        _id: doctorData._id,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        phone_number: doctorData.phone_number,
        age: doctorData.age,
        gender: doctorData.gender,
        profileId: {
          _id: profile._id,
          image: profile.image,
          specialization: profile.specialization,
          licenseNumber: profile.licenseNumber,
          experience: profile.experience,
          availability: profile.availability,
          visited_patients_length: profile.visited_patients.length,
          appointments_length: profile.appointments.length,
          feedbacks_length: profile.feedbacks.length,
        },
      };
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
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        match: { specialization: { $in: [specialization] } },
        select: "-visited_patients -appointments -feedbacks",
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
    const doctors = await User.aggregate([
      {
        $match: { role: "Doctor" },
      },
      {
        $lookup: {
          from: "Profile", // Replace with your actual profile collection name
          localField: "profileId",
          foreignField: "_id",
          as: "profile",
        },
      },
      {
        $unwind: "$profile",
      },
      {
        $lookup: {
          from: "Specialization",
          localField: "profile.specialization",
          foreignField: "_id",
          as: "profile.specialization",
        },
      },
      {
        $sort: { "profile.experience": -1 }, // Sort by experience (descending)
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
    ]);

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
export const getAllPatientsUnderADoctor = async (
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
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select: "visited_patients",
        populate: {
          path: "visited_patients",
          select: "-password -resetPasswordToken -resetPasswordExpire",
          populate: {
            path: "profileId",
            select: "image date_of_birth address blood_group",
          },
        },
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

// Get All Appointments Of A Doctor
export const getAllAppointmentsOfADoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.user?.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    const appointments = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select: "appointments",
        populate: {
          path: "appointments",
          populate: [
            {
              path: "patientId",
              select: "firstName lastName email phone_number",
            },
            {
              path: "doctorId",
              select: "firstName lastName email phone_number",
            },
          ],
        },
      });

    res.status(200).json({
      success: true,
      data: appointments,
      message: "Appointments retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Feedbacks Of A Doctor
export const getAllFeedbacksOfADoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.user?.id;

    const doctor = await User.findOne({ _id: id, role: "Doctor" });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    const feedbacks = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select: "feedbacks",
        populate: {
          path: "feedbacks",
          populate: [
            {
              path: "patient_id",
              select: "firstName lastName email phone_number",
            },
            {
              path: "doctor_id",
              select: "firstName lastName email phone_number",
            },
          ],
        },
      });

    res.status(200).json({
      success: true,
      data: feedbacks,
      message: "Feedbacks retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
