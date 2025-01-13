import { AuthRequest } from '../middlewares/auth';
import Feedback from '../models/Feedback';
import { Request, Response } from 'express';
import User from '../models/User';
import { z } from 'zod';

const getFeedbackSchema = z.object({
  patientId: z.string().nonempty("Patient ID is required"),
  doctorId: z.string().nonempty("Doctor ID is required"),
  rating: z.number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  message: z.string().nonempty("Message is required"),
});

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const parsedData = getFeedbackSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors: parsedData.error,
      });
    }

      const { patientId, doctorId, rating, message } = parsedData.data;

    const feedback = await Feedback.create({
      patient_id: patientId,
      doctor_id: doctorId,
      rating,
      message,
    });

    await User.findByIdAndUpdate(
        patientId,
        { $push: {feedbacks: feedback._id}},
        {new: true}
    );

    await User.findByIdAndUpdate(
      doctorId,
      { $push: {feedbacks: feedback._id}},
      {new: true}
  );


    return res.status(201).json({ 
      success: true,
      message: 'Feedback created successfully',
      data: feedback,
    });
  
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while creating feedback',
    });
  }
}

// export const getFeedback = async (req: Request, res: Response) => {
