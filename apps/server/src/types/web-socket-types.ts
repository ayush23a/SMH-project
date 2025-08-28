import { WebSocket } from "ws";


export interface CustomWebSocket extends WebSocket {
    id: string;
    user: {
        id: string,
    }
}


export enum MESSAGE_TYPE {
    JOIN_CHAT = 'JOIN_CHAT',
    LEAVE_CHAT = 'LEAVE_CHAT',

    SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE',

    SEND_MONEY_IN_CRYPTO = 'SEND_MONEY_IN_CRYPTO',
    SEND_MONEY_IN_CASH = 'SEND_MONEY_IN_CASH',
}