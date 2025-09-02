import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { CustomWebSocket, MESSAGE_TYPE } from "../types/web-socket-types";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "@repo/db/client";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export default class WebsocketServer {

    private wss: WebSocketServer;

    private socketMapping: Map<string, CustomWebSocket>; // websocket-id -> websocket
    private roomUsersMapping: Map<string, Set<CustomWebSocket>>; // roomId -> [...custom-websocket]

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });

        // add db queue

        this.socketMapping = new Map<string, CustomWebSocket>();
        this.roomUsersMapping = new Map();

        this.init();
    }

    private init() {
        try {

            // validate user in future
            this.wss.on('connection', (ws: CustomWebSocket, req) => {

                this.validateConnection(ws, req);

                ws.on('message', (data: string) => {
                    this.handleMessage(ws, data);
                });

                ws.on('close', () => {
                    this.cleanupSocket(ws);
                });

                ws.on('error', (error: unknown) => {
                    this.handleError(error);
                    this.cleanupSocket(ws);
                });

            })

        } catch (error) {
            this.handleError(error);
        }
    }

    private validateConnection(ws: CustomWebSocket, req: any) {
        const authToken = req.headers.authorization;
        if (!authToken) {
            ws.close();
            return;
        }
        const token = authToken.split(' ')[1];
        if (!token) {
            ws.close();
            return;
        }
        this.extractToken(ws, token);
    }

    private extractToken(ws: CustomWebSocket, token: string) {
        try {
            jwt.verify(token, JWT_SECRET!, async (err, decoded) => {
                if (err) {
                    ws.close();
                    return;
                }
                const decodedUser = decoded as AuthUser;
                await this.connectUser(ws, decodedUser.id);
            });
        } catch (error) {
            console.error("Error in extracting token: ", error);
            ws.close();
        }
    }

    private async connectUser(ws: CustomWebSocket, userId: string) {

        const validatedUser = await this.validateUserInDB(userId);

        if(!validatedUser) {
            ws.close();
            return;
        }

        const existingUser = this.socketMapping.get(ws.id);

        if (existingUser && existingUser.readyState === WebSocket.OPEN) {
            existingUser.close();
            this.cleanupSocket(ws);
        }

        ws.id = this.getSocketId();
        ws.user.id = validatedUser.id;
        this.socketMapping.set(ws.id, ws);
    }

    private async validateUserInDB(userId: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        
        return user;
    }

    private cleanupSocket(ws: CustomWebSocket) {
        if(this.socketMapping.has(ws.id)) {
            this.socketMapping.delete(ws.id);
        }
    }

    private handleMessage(ws: CustomWebSocket, data: string) {
        try {

            const message = JSON.parse(data);
            const { type, payload } = message;

            switch (type) {

                case MESSAGE_TYPE.JOIN_CHAT:
                    this.handleJoinChat(ws, payload);
                    break;

                case MESSAGE_TYPE.LEAVE_CHAT:
                    //
                    break;

                case MESSAGE_TYPE.SEND_CHAT_MESSAGE:
                    //
                    break;

                case MESSAGE_TYPE.SEND_MONEY_IN_CASH:
                    //
                    break;

                case MESSAGE_TYPE.SEND_MONEY_IN_CRYPTO:
                    //
                    break;

                default:
                    console.error("UNKNOWN MESSAGE TYPE: ", type);
                    break;
            }

        } catch (error) {
            this.handleError(error);
            return;
        }
    }

    private async handleJoinChat(ws: CustomWebSocket, payload: any) {
        try {
            
            

        } catch (error) {
            
        }
    }

    private sendMessage(ws: CustomWebSocket, message: any) {

    }

    private getSocketId() {
        return uuid();
    }

    private handleError(error: unknown) {
        if (error instanceof Error) {
            console.error("WEBSOCKET error: ", error);
        } else {
            console.error("unknown WEBSOCKET error");
        }
    }

}