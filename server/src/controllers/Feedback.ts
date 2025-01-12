import { AuthRequest } from '../middlewares/auth';
import Feedback from '../models/Feedback';
import { Request, Response } from 'express';
import User from '../models/User';

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, rating, message } = req.body;

    if(!patientId || !doctorId || !rating || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' });
    }

    if(rating<1 || rating>5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5' });
    }

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
