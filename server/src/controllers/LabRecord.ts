import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { z } from "zod";
import User from "../models/User";
import Appointment from "../models/Appointment";
import LabRecord from "../models/LabRecord";

const createLabRecordSchema = z.object({
  patientId: z.string(),
  appointmentId: z.string(),
  testName: z.string(),
  testResult: z.string(),
  filePath: z.string(),
});

// Create a new lab record
export const createLabRecord = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = createLabRecordSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { patientId, appointmentId, testName, testResult, filePath } =
      parsedData.data;

    // Check if the patient exists
    const patient = await User.findById(patientId);

    if (!patient || patient.role !== "Patient") {
      res.status(404).json({
        success: false,
        message: "Patient not found",
      });
      return;
    }

    // Check if the appointment exists
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      doctorId: id,
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    // Create a new lab record
    await LabRecord.create({
      patientId,
      doctorId: id,
      appointmentId,
      testName,
      testResult,
      filePath,
    });

    res.status(201).json({
      success: true,
      message: "Lab record created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
