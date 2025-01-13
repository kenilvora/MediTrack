import { Request, Response } from "express";
import Patient from "../models/Patient";
//import HealthRecord from "../models/HealthRecord";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import HealthRecord from "../models/HealthRecord";
import Prescription from "../models/Prescription";
import LabRecord from "../models/LabRecord";
import {z} from "zod";

const updatePatientProfileSchema = z.object({
    address: z.string().optional(),
});

// Update Patient Profile
export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const parsedData = updatePatientProfileSchema.safeParse(req.body);

    if(!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors: parsedData.error,
      });
    }
    let {address} = parsedData.data;

    const id = req.user?.id || req.params.id;

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

// Get all patients under a doctor (admin,doctor)
export const getAllPatientsUnderADoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const doctorId =
      req.user?.role === "Admin" ? req.params.doctorId : req.user?.id;
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
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving patients", success: false });
  }
};

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

export const getAllVisitedDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;

    if(!patientId) {
       return res.status(403).json({
        success: false,
        message: "please login",
      })
    }

    const Doctors = await User.findById(patientId)
      .select("visited_doctors")
      .populate({
        path: "visited_doctors",
        model: "User",
        select: "firstName lastName email phone_number profileId", 
          populate: {
              path: "profileId", // Populate profileId (which contains the specialization)
              select: "specialization licenseNumber experience image", 
    },
  })

    if (!Doctors) {
      return res.status(404).json({
        success: false,
        message: "Doctors not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: Doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctors",
    });
  }
}

export const getHealthRecordOfPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;

    const HealthRecordOfPatient = await HealthRecord.findById(patientId);

    if (!HealthRecordOfPatient) {
      return res.status(404).json({
        success: false,
        message: "Health Record not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Health Record retrieved successfully",
      data: HealthRecordOfPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve health record",
    });

  }

}

export const getAllLabReportsOfPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;

    const LabReportsOfPatient = await LabRecord.findById(patientId);

    if (!LabReportsOfPatient) {
      return res.status(404).json({
        success: false,
        message: "Lab Reports not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Lab Reports retrieved successfully",
      data: LabReportsOfPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lab reports",
    });

  }
}

export const getAllPrescriptionsOfPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.id;

    const PrescriptionsOfPatient = await Prescription.findById(patientId)
      .select("medication dosage")
      .populate({
        path: "doctorId",
        select: "firstName lastName",
      })
      .populate({
        path: "appointmentId",
        select: "dateTime",
      })

    if (!PrescriptionsOfPatient) {
      return res.status(404).json({
        success: false,
        message: "Prescriptions not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Prescriptions retrieved successfully",
      data: PrescriptionsOfPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve prescriptions",
    });

  }
}

export const getAllFeedbacksofPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params?.id;

    if(!patientId) {
      return res.status(403).json({
        success: false,
        message: "please login",
      })
    }

    const patient = await Patient.findById(patientId)
      .select("feedbacks")
      .populate({
        path: "feedbacks",
        select: "doctorId patientId rating message",
      })

      if(!patient || !patient.feedbacks.length) {
        return res.status(404).json({
          success: false,
          message: "Feedbacks not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Feedbacks retrieved successfully",
        data: patient.feedbacks,
      });
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve feedbacks",
      });

    }
  }
