import { Request, Response } from "express";
import prisma from '@repo/db/client';
import token from "../jwt/token";


export default async function signInController(req: Request, res: Response) {
    try {
        
        const { user } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            }
        });

        let myUser;

        if(existingUser) {
            myUser = await prisma.user.update({
                where: {
                    email: user.email,
                },
                data: {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            });
        } else {
            myUser = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            });
        }

        const { success, data } = token.signToken(myUser.name, myUser.email, myUser.id);

        if(!success || !data) {
            res.status(404).json({
                message: 'Invalid data'
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'User updated successfully',
            user: myUser,
            token: data,
        });

    } catch (error) {
        console.error("Error in signing-in: ", error)
    }
}