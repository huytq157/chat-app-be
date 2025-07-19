"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const auth_middleware_1 = require("./auth.middleware");
const presence_handler_1 = require("./presence.handler");
const conversation_handler_1 = require("./conversation.handler");
const message_handler_1 = require("./message.handler");
const typing_handler_1 = require("./typing.handler");
/**
 * Handles all real-time chat socket events and logic for the chat application.
 *
 * This class encapsulates the initialization and management of a Socket.IO server,
 * including authentication, user presence, messaging, typing indicators, and video call signaling.
 *
 * ## Features
 * - Initializes Socket.IO with CORS and transport options.
 * - Authenticates users via JWT tokens in cookies during socket handshake.
 * - Tracks online/offline status of users and broadcasts status changes.
 * - Manages joining and leaving chat conversations (rooms).
 * - Handles sending, receiving, and reading messages, including media and special message types.
 * - Emits typing indicators to other users.
 * - Manages WebRTC signaling for video calls (offer, answer, ICE candidates, reject, end).
 * - Updates conversation metadata (last message, unread counts) in the database.
 *
 * ## Dependencies
 * - `UserModel`, `Message`, and `Conversation` Mongoose models for database operations.
 * - `verifySocketToken` for JWT authentication.
 * - Expects environment variable `CLIENT_URL` for CORS configuration.
 *
 * ## Events
 * - `users:online`, `user:status` for presence.
 * - `message:new`, `conversation:updated`, `message:read` for messaging.
 * - `typing:start`, `typing:stop` for typing indicators.
 * - `call:offer`, `call:answer`, `call:ice-candidate`, `call:rejected`, `call:ended` for video calls.
 *
 * @class
 * @example
 * ```typescript
 * import http from 'http';
 * const server = http.createServer(app);
 * const chatSocket = new ChatSocket(server);
 * ```
 */
class ChatSocket {
    constructor(server) {
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: env_1.env.CLIENT_URL,
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                allowedHeaders: [
                    "Content-Type",
                    "Authorization",
                    "X-Requested-With",
                    "Accept",
                ],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use(auth_middleware_1.socketAuthMiddleware);
        this.io.on("connection", (socket) => {
            (0, presence_handler_1.handleConnection)(this.io, socket, this.connectedUsers);
            // Đăng ký các handler
            (0, conversation_handler_1.registerConversationHandlers)(socket);
            (0, message_handler_1.registerMessageHandlers)(this.io, socket, this.connectedUsers);
            (0, typing_handler_1.registerTypingHandlers)(socket);
            // Sự kiện disconnect
            socket.on("disconnect", () => {
                (0, presence_handler_1.handleDisconnect)(this.io, socket, this.connectedUsers);
            });
            // Test event
            socket.on("test:ping", () => {
                socket.emit("test:pong", {
                    message: "Server is working!",
                    timestamp: new Date(),
                });
            });
        });
    }
}
exports.default = ChatSocket;
