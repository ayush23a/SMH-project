import prisma from "@repo/db/client";
import { Request, Response } from "express";


export default async function getUserDataController(req: Request, res: Response) {
    try {
        
        const { userId } = req.params;

        if(!userId) {
            res.status(400).json({
                success: false,
                message: 'UserId not found',
            });
            return;
        }

        const userData = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                walletAddress: true,

            }
        });

        if(!userData) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User fetched successfully!',
            data: userData,
        });
        return;

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
        return;
    }
}