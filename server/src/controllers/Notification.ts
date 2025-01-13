import { Request, Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middlewares/auth";
import {z} from "zod";

const createNotificationSchema = z.object({
    userId: z.string().nonempty("User ID is required"),
    title: z.string().nonempty("Title is required"),
    message: z.string().nonempty("Message is required"),
});

export const createNotification = async (req: AuthRequest, res: Response) => {
    try{

       const parsedData = createNotificationSchema.safeParse(req.body);

        if(!parsedData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid data",
                errors: parsedData.error,
            })
        }

        const {userId, title, message} = parsedData.data;

        const notification = await Notification.create({
            user_id: userId,
            title,
            message,
            isRead: false
        });

        return res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        })      
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating notification'
        })          
    }
}