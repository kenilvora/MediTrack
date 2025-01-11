import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth";
import HealthRecord from "../models/HealthRecord";

const createHealthRecordSchema = z.object({
  disease: z.array(z.string()),
  description: z.string(),
});

const updateHealthRecordSchema = z.object({
  disease: z.array(z.string()),
  description: z.string(),
});

// Create a new health record
export const createHealthRecord = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = createHealthRecordSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
        data: parsedData.error,
      });
      return;
    }

    const { disease, description } = parsedData.data;

    await HealthRecord.create({
      patient_id: req.user?.id,
      disease,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Health record created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update an existing health record
export const updateHealthRecord = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const healthRecordId = req.params.id;
    const id = req.user?.id;

    const parsedData = updateHealthRecordSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
        data: parsedData.error,
      });
      return;
    }

    const { disease, description } = parsedData.data;

    const healthRecord = await HealthRecord.findOne({
      _id: healthRecordId,
      patient_id: id,
    });

    if (!healthRecord) {
      res.status(404).json({
        success: false,
        message: "Health record not found",
      });
      return;
    }

    healthRecord.disease = disease;
    healthRecord.description = description;

    await healthRecord.save();

    res.status(200).json({
      success: true,
      message: "Health record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete an existing health record
export const deleteHealthRecord = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const healthRecordId = req.params.id;
    const id = req.user?.id;

    const healthRecord = await HealthRecord.findOne({
      _id: healthRecordId,
      patient_id: id,
    });

    if (!healthRecord) {
      res.status(404).json({
        success: false,
        message: "Health record not found",
      });
      return;
    }

    await HealthRecord.deleteOne({ _id: healthRecordId, patient_id: id });

    res.status(200).json({
      success: true,
      message: "Health record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
