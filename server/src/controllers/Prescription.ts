import Prescription from "../models/Prescription"
import { AuthRequest } from "../middlewares/auth"
import { Request, Response } from "express"
import Patient from "../models/Patient";

export const createPrescription = async (Req: AuthRequest, res: Response) => {
    try{
        const {patientId, doctorId, appointmentId, medication, dosage} = Req.body;

        if(!patientId || !doctorId || !appointmentId || !medication || !dosage) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
    }

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
        const {prescriptionId, patientId, doctorId, appointmentId, medication, dosage} = Req.body;

        if(!prescriptionId || !patientId || !doctorId || !appointmentId || !medication || !dosage) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
    }

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
        const {prescriptionId, patientId} = Req.body;

        if(!prescriptionId || !patientId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
    }

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
