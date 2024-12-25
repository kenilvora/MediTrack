import { Request, Response } from "express";
import Patient from "../models/Patient";
import HealthRecord from "../models/HealthRecord";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth";

// Update Patient Profile
export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { dob, address, bloodGroup } = req.body;

    const id = req.user?.id;

    if (!dob || !address || !bloodGroup) {
      res.status(403).json({
        success: false,
        message: "please fill all details",
      });
      return;
    }

    const user = await User.findById(id);

    const profileId = user?.profileId;

    await Patient.findByIdAndUpdate(
      profileId,
      { dob, address, bloodGroup },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", success: false });
    return;
  }
};

// Get all patients (admin)
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || "";

    const patients = await User.find({
      role: "Patient",
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    })
      .select("-password")
      .populate("profileId");

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patients", success: false });
    return;
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
      .select("-password")
      .populate("profileId");

    if (!patient) {
      res.status(404).json({ message: "Patient not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient", success: false });
    return;
  }
};

// Get the current patient's profile (patient)
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    const patient = await User.findOne({
      _id: id,
      role: "Patient",
    })
      .select("-password")
      .populate("profileId");

    if (!patient) {
      res.status(404).json({ message: "Patient not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patient", success: false });
    return;
  }
};

// Get all patients under a doctor (doctor)
export const getAllPatientsUnderADoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const doctorId = req.params.doctorId;
    const patients = await User.findById(doctorId)
      .select("-password")
      .populate({
        path: "profileId",
        populate: [
          {
            path: "visited_patients",
            select: "firstName lastName email phone_number",
          },
        ],
      });

    if (!patients) {
      res.status(404).json({ message: "Patients not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patients", success: false });
    return;
  }
};

// Get all patients of same disease (doctor)
export const getAllPatientsOfSameDisease = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const disease = req.params.disease;

    const patients = await HealthRecord.find({
      disease,
    }).populate({
      path: "patient_id",
      select: "firstName lastName email phone_number",
    });

    if (!patients) {
      res.status(404).json({ message: "Patients not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patients", success: false });
    return;
  }
};

// Get all patients of same blood group (doctor)
export const getAllPatientsOfSameBloodGroup = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const bloodGroup = req.params.bloodGroup;
    const patients = await User.find({
      role: "Patient",
    })
      .select("-password")
      .populate({
        path: "profileId",
        match: {
          blood_group: bloodGroup,
        },
      });

    if (!patients) {
      res.status(404).json({ message: "Patients not found", success: false });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patients", success: false });
    return;
  }
};
