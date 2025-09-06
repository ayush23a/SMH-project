import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { CustomWebSocket, MESSAGE_TYPE, SentMessageType } from "../types/web-socket-types";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma, { MessageType, User } from "@repo/db/client";
import type DatabaseQueue from "../queue/DatabaseQueue";
import { databaseQueueInstance, redisCacheInstance } from "../services/init-services";
import RedisCache from "../cache/RedisCache";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export default class WebsocketServer {

    private wss: WebSocketServer;

    private socketMapping: Map<string, CustomWebSocket>; // websocket-id -> websocket
    private roomUsersMapping: Map<string, Set<string>>; // roomId -> [...ws.id]
    // private userSockets: Map<string, Set<CustomWebSocket>>; // userId -> [...custom-websocket]

    private databaseQueue: DatabaseQueue;
    private redisCache: RedisCache;

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });

        // add db queue
        this.databaseQueue = databaseQueueInstance;
        this.redisCache = redisCacheInstance;

        this.socketMapping = new Map<string, CustomWebSocket>();
        this.roomUsersMapping = new Map();
        // this.userSockets = new Map();

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

        if (!validatedUser) {
            ws.close();
            return;
        }

        const existingUser = this.socketMapping.get(ws.id);

        if (existingUser && existingUser.readyState === WebSocket.OPEN) {
            existingUser.close();
            // also remove from the room - ws map
            this.cleanupSocket(ws);
        }

        ws.id = this.getSocketId();
        ws.user.id = validatedUser.id;
        this.socketMapping.set(ws.id, ws);
        this.createRooms(ws, validatedUser);
    }

    private async createRooms(
        ws: CustomWebSocket,
        validatedUser: {
            id: string;
            name: string;
            email: string;
            image: string | null;
            walletAddress: string | null;
            Rooms: {
                id: string;
                private: boolean;
            }[];
        }
    ) {

        // also add the user to the redis-cache
        await this.redisCache.setUser(validatedUser.id, validatedUser);

        try {
            for (const room of validatedUser.Rooms) {
                const usersInRoom = this.roomUsersMapping.get(room.id) ?? new Set<string>();
                usersInRoom.add(ws.id);
                this.roomUsersMapping.set(room.id, usersInRoom);
            }

        } catch (error) {
            console.error("Error while setting rooms: ", error);
            return;
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
                    this.handleSendMessage(ws, payload);
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

    private async handleSendMessage(ws: CustomWebSocket, payload: any) {
        try {

            const { roomId, message } = payload;

            // from redis-cache find if the message is sent to user's friend or room where user is present
            const user = await this.redisCache.getUser(ws.user.id);

            if(!user) {
                console.error("user doesn't exist in cache");
                return;
            }

            const sendingMessage: SentMessageType = {
                type: MESSAGE_TYPE.SEND_CHAT_MESSAGE,
                payload: {
                    roomId: roomId,
                    message: message,
                },
            };

            this.broadcastMessage(
                roomId,
                sendingMessage,
                ws.id
            );

            this.databaseQueue.createChatMessage(
                ws.user.id,
                roomId,
                ws.user.id,
                message,
                MessageType.MESSAGE,
            )

        } catch (error) {
            console.error("Error in sending message: ", error);
            return;
        }
    }

    private broadcastMessage(
        roomId: string,
        message: any,
        excludeSocketId?: string,
        onlySocketId?: string,
    ) {

        if(onlySocketId) {
            const socketIdExists = this.socketMapping.get(onlySocketId);
            if(socketIdExists && socketIdExists.readyState === WebSocket.OPEN) {
                socketIdExists.send(JSON.stringify(message));
            }
            return;
        }
        
        const userSocketIds = this.roomUsersMapping.get(roomId);

        userSocketIds?.forEach((socketId) => {
            if(excludeSocketId === socketId) {
                return;
            }
            const userSocketId = this.socketMapping.get(socketId);
            if(userSocketId && userSocketId.readyState === WebSocket.OPEN) {
                userSocketId.send(JSON.stringify(message));
            }
        })

    }

    private cleanupSocket(ws: CustomWebSocket) {
        if (this.socketMapping.has(ws.id)) {
            this.socketMapping.delete(ws.id);
        }
    }

    private async validateUserInDB(userId: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                walletAddress: true,
                Rooms: true,
            },
        });

        return user;
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