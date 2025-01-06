// Add Specialization -> name field -> !name -> lower case and uppercase -> unique
// Remove Specialization -> id field -> !id
// Get All Specialization

import { Request, Response } from "express";
import  Specialization from "../models/Specialization";
import { z } from "zod";

const addSpecializationSchema = z.object({
    name: z.string().nonempty(),
}); 

const removeSpecializationSchema = z.object({
    id: z.string().nonempty(),
});

export const AddSpecialization = async (req: Request, res: Response) : Promise<void> => {
    try{
        const parsedData = addSpecializationSchema.safeParse(req.body);

        if(!parsedData.success){
            res.status(400).json({success: false, message: "Invalid Data"});
            return;
        }
        
        const { name } = parsedData.data;

        const specialization = await Specialization.findOne({
            name: name.toLowerCase()
        })

        if(specialization){
            res.status(400).json({success: false, message: "Specialization already exists"});
            return;
        }

        await Specialization.create({
            name: name.toLowerCase()
        })

        res.status(200).json({success: true, message: "Specialization added successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const RemoveSpecialization = async (req: Request, res: Response) : Promise<void> => {
    try{
        const parsedData = removeSpecializationSchema.safeParse(req.body);

        if(!parsedData.success){
            res.status(400).json({success: false, message: "Invalid Data"});
            return;
        }

        const { id } = parsedData.data;

        const specialization = await Specialization.findById(id);

        if(!specialization){
            res.status(400).json({success: false, message: "Specialization does not exist"});
            return;
        }

        await Specialization.findByIdAndDelete(id);

        res.status(200).json({success: true, message: "Specialization removed successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const GetAllSpecialization = async (req: Request, res: Response) : Promise<void> => {
    try{
        const filter = req.query.filter || "";

        const specializations = await Specialization.find({
            name: {
                $regex: filter,
                $options: "i"
            }
        });

        res.status(200).json({success: true, specializations});
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}