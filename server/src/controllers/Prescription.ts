import Prescription from "../models/Prescription"
import { AuthRequest } from "../middlewares/auth"
import { Request, Response } from "express"
import Patient from "../models/Patient";
import {z} from "zod";

const createPrescriptionSchema = z.object({
    patientId: z.string().nonempty("Patient ID is required"),
    doctorId: z.string().nonempty("Doctor ID is required"),
    appointmentId: z.string().nonempty("Appointment ID is required"),
    medication: z.string().nonempty("Medication is required"),
    dosage: z.string().nonempty("Dosage is required"),
});

const updatePrescriptionSchema = z.object({
    prescriptionId: z.string().nonempty("Prescription ID is required"),
    patientId: z.string(),
    medication: z.string().optional(),
    dosage: z.string().optional(),
  });

const deletePrescriptionSchema = z.object({
    prescriptionId: z.string().nonempty("Prescription ID is required"),
    patientId: z.string().nonempty("Patient ID is required"),
});

export const createPrescription = async (Req: AuthRequest, res: Response) => {
    try{

        const parsedData = createPrescriptionSchema.safeParse(Req.body);

        if(!parsedData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data",
                errors: parsedData.error,
            })
        }
        const {patientId, doctorId, appointmentId, medication, dosage} = parsedData.data;

    const prescription = await Prescription.create({
        patientId,
        doctorId,
        appointmentId,
        medication,
        dosage
    })

    await Patient.findByIdAndUpdate(
        patientId,
        { $push: {prescriptions: prescription._id}},
        {new: true}
    );

    return res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        data: prescription
    })
}catch(error){
    return res.status(500).json({
        success: false,
        message: 'An error occurred while creating prescription'
    })          
}
}

export const updatePrescription = async (Req: AuthRequest, res: Response) => {
    try{
        const parsedData = updatePrescriptionSchema.safeParse(Req.params);    

        if(!parsedData.success) {  
            return res.status(400).json({
                success: false,
                message: "Invalid data",
                errors: parsedData.error,
            })
        }   
        const {prescriptionId , patientId, medication, dosage} = parsedData.data;

      const updatedPrescription = await Prescription.findByIdAndUpdate(
        prescriptionId,
        {medication, dosage},
        {new: true}
    );

      await Patient.findByIdAndUpdate(
        patientId,
        { $push: {prescriptions: updatedPrescription?._id}},
        {new: true}
    );

      return res.status(200).json({
        success: true,
        message: 'Prescription updated successfully',
        data: updatedPrescription
      })
  }catch(error){
      return res.status(500).json({
          success: false,
          message: 'An error occurred while updating prescription'
      })          
  }
  }

  export const deletePrescription = async (Req: AuthRequest, res: Response) => {
    try{
        
        const parsedData = deletePrescriptionSchema.safeParse(Req.body);

        if(!parsedData.success) {   
            return res.status(400).json({
                success: false,
                message: "Invalid data",
                errors: parsedData.error,
            })
        }

        const {prescriptionId, patientId} = parsedData.data;

        const deletedPrescription = await Prescription.findByIdAndDelete(prescriptionId);


        if(!deletePrescription){
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            })
        }

        await Patient.findByIdAndUpdate(
            patientId,
            { $pull: {prescriptions: deletedPrescription?._id}},
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: 'Prescription deleted successfully',
            data: deletedPrescription
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting prescription'
        })          
    }
}
