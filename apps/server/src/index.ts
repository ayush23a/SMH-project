import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import WebsocketServer from "./sockets/WebSocketServer";


dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());

app.use(
    cors({
        origin: "*"
    }),
);

new WebsocketServer(server);

const PORT = 8080;

server.listen(PORT);
