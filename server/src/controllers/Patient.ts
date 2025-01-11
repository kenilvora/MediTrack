import { Request, Response } from "express";
import Patient from "../models/Patient";
import HealthRecord from "../models/HealthRecord";
import User from "../models/User";
import Appointment from "../models/Appointment";
import { AuthRequest } from "../middlewares/auth";
import { populate } from "dotenv";

// Update Patient Profile
export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    let {address} = req.body;

    const id = req.user?.id;

    if (!address) {
      res.status(403).json({
        success: false,
        message: "please fill details",
      });
      return;
    }

    const user = await User.findById(id);

    const profileId = user?.profileId;

    const patient = await Patient.findById(profileId);

    address = address || patient?.address;
    
    await Patient.findByIdAndUpdate(
      profileId,
      { address},
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", success: false });
  }
};

// Get all patients (admin)
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page-1)*limit;

    const patients = await User.find({
      role: "Patient",
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    })
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select: "date_of_birth, address, blood_group, image",
      }).skip(skip)
      .limit(limit)
      .sort({createdAt: -1});

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
      page,
      limit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: (error as Error).message || "Error retrieving patients", success: false });
  }
};

//Get patient by id (admin, doctor)
export const getPatientById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const patient = await User.findOne({
      _id: id,
      role: "Patient",
    })
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate({
        path: "profileId",
        select: "date_of_birth, address, blood_group, image",
      });

    if (!patient) {
      res.status(404).json({ message: "Patient not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient", success: false });
  }
};

// Get the current patient's profile (patient)
// export const getMe = async (req: AuthRequest, res: Response) => {
//   try {
//     const id = req.user?.id;
//     const patient = await User.findOne({
//       _id: id,
//       role: "Patient",
//     })
//       .select("-password")
//       .populate("profileId");

//     if (!patient) {
//       res.status(404).json({ message: "Patient not found", success: false });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "Your data retrieved successfully",
//       data: patient,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving your data", success: false });
//   }
// };

// Get all patients under a doctor (admin,doctor)
// export const getAllPatientsUnderADoctor = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const doctorId =
//       req.user?.role === "Admin" ? req.params.doctorId : req.user?.id;
//     const patients = await User.findById(doctorId)
//       .select("-password")
//       .populate({
//         path: "profileId",
//         populate: [
//           {
//             path: "visited_patients",
//             select: "firstName lastName email phone_number",
//           },
//         ],
//       });

//     if (!patients) {
//       res.status(404).json({ message: "Patients not found", success: false });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "Patients retrieved successfully",
//       data: patients,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving patients", success: false });
//   }
// };

// // Get all patients of same disease (doctor)
// export const getAllPatientsOfSameDisease = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const disease = req.params.disease;

//     const patients = await HealthRecord.find({
//       disease,
//     }).populate({
//       path: "patient_id",
//       select: "firstName lastName email phone_number",
//     });

//     if (!patients) {
//       res.status(404).json({ message: "Patients not found", success: false });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "Patients retrieved successfully",
//       data: patients,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving patients", success: false });
//   }
// };

// // Get all patients of same blood group (doctor)
// export const getAllPatientsOfSameBloodGroup = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const bloodGroup = req.params.bloodGroup;
//     const patients = await User.find({
//       role: "Patient",
//     })
//       .select("-password")
//       .populate({
//         path: "profileId",
//         match: {
//           blood_group: bloodGroup,
//         },
//       });

//     if (!patients) {
//       res.status(404).json({ message: "Patients not found", success: false });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "Patients retrieved successfully",
//       data: patients,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving patients", success: false });
//   }
// };

export const GetAllAppointmentsofPatient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.user?.role === "Patient" ? req.user.id : req.params.id;

    const Appointments = await User.findById(id)
      .select("-password")
      .populate({
        path: "profileId",
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
        select: "appointments",
      });

      if (!Appointments) {
        return res.status(404).json({
          success: false,
          message: "User not found or no appointments available",
        });
      }

    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: Appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
    });
  }
};

