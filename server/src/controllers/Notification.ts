import { Request, Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middlewares/auth";

export const createNotification = async (req: AuthRequest, res: Response) => {
    try{
        const{userId, title, message} = req.body;

        if(!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })

        }

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