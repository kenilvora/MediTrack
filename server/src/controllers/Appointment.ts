import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";

const createAppointmentSchema = z.object({
  doctorId: z.string(),
  dateTime: z.string(),
  disease: z.array(z.string()),
  notes: z.string().optional(),
});

// Create a new appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const parsedData = createAppointmentSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors: parsedData.error,
      });
    }

    const { doctorId, dateTime, disease, notes } = parsedData.data;

    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== "Doctor") {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await Appointment.create({
      patientId: req.user?.id,
      doctorId,
      dateTime,
      disease,
      notes,
    });

    res.json({
      success: true,
      message: "Appointment created successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const id = req.user?.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });
    }

    await Appointment.deleteOne({ _id: appointmentId, patientId: id });

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
