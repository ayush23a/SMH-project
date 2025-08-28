import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { CustomWebSocket, MESSAGE_TYPE } from "../types/web-socket-types";


export default class WebsocketServer {

    private wss: WebSocketServer;

    private socketMapping: Map<string, CustomWebSocket>; // websocket -> custom-websocket
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
            this.wss.on('connection', (ws: CustomWebSocket) => {

                this.handleConnection(ws);

                ws.on('message', (data: string) => {
                    this.handleMessage(ws, data);
                });

                ws.on('close', () => {

                });

                ws.on('error', (error: unknown) => {

                });

            })

        } catch (error) {
            this.handleError(error);
        }
    }

    private handleConnection(ws: CustomWebSocket) {
        
    }

    private handleMessage(ws: CustomWebSocket, data: string) {
        try {

            const message = JSON.parse(data);
            const { type, payload } = message;

            switch (type) {

                case MESSAGE_TYPE.JOIN_CHAT:
                    //
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

        }
    }

    private handleError(error: unknown) {
        if (error instanceof Error) {
            console.error("WEBSOCKET error: ", error);
        } else {
            console.error("unknown WEBSOCKET error");
        }
    }

}