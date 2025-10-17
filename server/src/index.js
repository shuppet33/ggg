import express from "express"
import cors from "cors"
import cookie from "cookie"
import dotenv from "dotenv"
import {Server} from 'socket.io'
import process from "node:process"
import {createServer} from 'node:http'
import {router} from "./routes/route.js"
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {initAdmin} from "./utils/authAdmin.js";
import jwt from "jsonwebtoken";
import {gameState, tasks, teams} from "./db/db.js";
import {SetupSocket} from "./socket/setupSocket.js";

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
    connectionStateRecovery: {},
})

const FRONT_URL = process.env.FRONT_URL || "http://localhost:5173";

await initAdmin();

app.use(helmet());
app.use(cors({
    origin: FRONT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api", router)

io.use((socket, next) => {
    const rawCookies = socket.request.headers.cookie; // сырые куки
    if (!rawCookies) return next(new Error("Нет куки"));

    // Парсим куки
    const parsedCookies = cookie.parse(rawCookies);
    const token = parsedCookies.token; // JWT из куки
    if (!token) return next(new Error("Нет токена"));

    socket.data.token = token; // сохраняем токен в сокете
    next();
});

SetupSocket(io)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})


