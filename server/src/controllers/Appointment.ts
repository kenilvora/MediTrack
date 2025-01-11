import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import Patient from "../models/Patient";
import Doctor from "../models/Doctor";

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

    const appointment = await Appointment.create({
      patientId: req.user?.id,
      doctorId,
      dateTime,
      disease,
      notes,
    });

    await Patient.updateOne(
      {
        _id: req.user?.id,
      },
      {
        $push: {
          appointments: appointment._id,
        },
      }
    );

    await Doctor.updateOne(
      {
        _id: doctorId,
      },
      {
        $push: {
          appointments: appointment._id,
        },
      }
    );

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

    await Patient.updateOne(
      {
        _id: id,
      },
      {
        $pull: {
          appointments: appointmentId,
        },
      }
    );

    await Doctor.updateOne(
      {
        _id: appointment.doctorId,
      },
      {
        $pull: {
          appointments: appointmentId,
        },
      }
    );

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

// Mark an appointment as completed
export const completeAppointment = async (req: AuthRequest, res: Response) => {
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
        message: "Appointment already completed",
      });
    }

    await Appointment.updateOne(
      {
        _id: appointmentId,
        patientId: id,
      },
      {
        status: "completed",
      }
    );

    await Patient.updateOne(
      {
        _id: id,
      },
      {
        $pull: {
          visited_doctors: appointment.doctorId,
        },
      }
    );

    await Doctor.updateOne(
      {
        _id: appointment.doctorId,
      },
      {
        $pull: {
          visited_patients: id,
        },
      }
    );

    res.json({
      success: true,
      message: "Appointment marked as completed",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
