import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { env } from "../config/env";
import { socketAuthMiddleware } from "./auth.middleware";
import { handleConnection, handleDisconnect } from "./presence.handler";
import { registerConversationHandlers } from "./conversation.handler";
import { registerMessageHandlers } from "./message.handler";
import { registerTypingHandlers } from "./typing.handler";

interface ConnectedUser {
  userId: string;
  socketId: string;
}

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
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.CLIENT_URL,
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

  private setupSocketHandlers() {
    this.io.use(socketAuthMiddleware);
    this.io.on("connection", (socket) => {
      handleConnection(this.io, socket, this.connectedUsers);
      // Đăng ký các handler
      registerConversationHandlers(socket);
      registerMessageHandlers(this.io, socket, this.connectedUsers);
      registerTypingHandlers(socket);
      // Sự kiện disconnect
      socket.on("disconnect", () => {
        handleDisconnect(this.io, socket, this.connectedUsers);
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

export default ChatSocket;
