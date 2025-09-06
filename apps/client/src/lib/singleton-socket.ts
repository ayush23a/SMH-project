import WebSocketClient from "../socket/socket";


let client: WebSocketClient | null = null;
let currentUserId: string | null = null;

export function getWebSocketClient(userId: string) {

    if(client && currentUserId === userId) {
        return client;
    }

    if(client && currentUserId !== userId) {
        client.close();
        client = null;
    }

    client = new WebSocketClient(`ws://localhost:8080/ws?userId=${userId}`);
    currentUserId = userId;

    return client;
}

export function cleanWebSocketClient() {
    if(client) {
        client.close();
    }
    client = null;
    currentUserId = null;
}

export function getCurrentUserId() {
    return currentUserId;
}