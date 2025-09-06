import Bull from "bull";
import { JobOption, QueueJobTypes } from "../types/database-queue-type";
import prisma, { MessageType } from "@repo/db/client";

interface CreateChatMessageJobType {
    id: string, // give senderId
    roomId: string,
    senderId: string,
    message: string,
    messageType: MessageType,
}

const REDIS_URL = process.env.REDIS_URL;
export default class DatabaseQueue {
    private databaseQueue: Bull.Queue;
    private defaultJobOptions: JobOption = {
        attempts: 3,
        delay: 1000,
        removeOnComplete: 10,
        removeOfFail: 5
    };

    constructor() {
        this.databaseQueue = new Bull('database-operations', {
            redis: REDIS_URL,
        });
        this.setupProcessors();
    }

    private setupProcessors() {
        this.databaseQueue.process(
            QueueJobTypes.CREATE_CHAT_MESSAGE,
            this.createChatMessageProcessor.bind(this),
        );
    }

    private async createChatMessageProcessor(
        job: Bull.Job,
    ) {
        try {
            
            const { roomId, senderId, message, messageType }: CreateChatMessageJobType = job.data;

            const createChatMessage = await prisma.chatMessage.create({
                data: {
                    message: message,
                    messateType: messageType,
                    senderId: senderId,
                    roomId: roomId,
                },
            });

            return {
                success: true,
                chatMessage: createChatMessage,
            };
        } catch (error) {
            console.error("Error while processing chat message create: ", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    public async createChatMessage(
        id: string, // give senderId
        roomId: string,
        senderId: string,
        message: string,
        messageType: MessageType,
        options?: Partial<JobOption>
    ) {
        return await this.databaseQueue.add(
            QueueJobTypes.CREATE_CHAT_MESSAGE,
            { id, roomId, senderId, message, messageType },
            { ...this.defaultJobOptions, ...options },
        )
            .catch((error) => console.error('Failed to enqueue chat message: ', error));
    }

}