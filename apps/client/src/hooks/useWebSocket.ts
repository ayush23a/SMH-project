import { useRef } from "react";
import WebSocketClient, { MessagePayload } from "../socket/socket"
import { usePathname } from "next/navigation";
import { MESSAGE_TYPE } from "../types/web-socket-types";



export const useWebSocket = () => {
    const socket = useRef<WebSocketClient | null>(null);
    const pathname = usePathname(); // figure out this


    function subscribeToHandler(type: string, handler: (payload: unknown) => void) {
        if (!socket.current) {
            console.warn('Attempting to subscribe but no socket connection available');
            return;
        }
        socket.current.subscribe_to_handlers(type, handler);
    }

    function unsubscribeToHandler(type: string, handler: (payload: unknown) => void) {
        if (!socket.current) {
            console.warn('Attempting to subscribe but no socket connection available');
            return;
        }
        socket.current.unsubscribe_to_handlers(type, handler);
    }

    function handleSendChatMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPE.SEND_CHAT_MESSAGE,
            payload: payload,
        };
        if(socket.current) {
            socket.current.send_message(message);
        }
    }

    return {
        socket: socket.current,
        isConnected: socket.current?.is_connected || false,
        subscribeToHandler,
        unsubscribeToHandler,
        handleSendChatMessage,
    }

}