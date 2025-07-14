import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { IMessage } from "../models/message.models";
import { IConversation } from "../models/conversation.models";
import { Message } from "../models/message.models";
import { Conversation } from "../models/conversation.models";
import { verifySocketToken } from "../middleware/verifyToken";
import { env } from "../config/env";
import { UserModel } from "../models/users.models";

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

    console.log("Socket.IO server initialized with CORS:", {
      origin: env.CLIENT_URL,
      credentials: true,
    });

    this.setupSocketHandlers();
  }

  private async getOnlineUsersFromDB() {
    try {
      const onlineUsers = await UserModel.find(
        { status: "online" },
        { _id: 1 }
      ).lean();
      return onlineUsers.map((user) => ({
        userId: user._id.toString(),
        status: "online",
      }));
    } catch (error) {
      console.error("Error getting online users from DB:", error);
      return [];
    }
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        // Get token from cookies
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
          console.log("Socket connection failed: No cookies found");
          return next(new Error("Authentication error"));
        }

        // Parse cookies to get token
        const token = cookies
          .split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          console.log("Socket connection failed: No token in cookies");
          return next(new Error("Authentication error"));
        }

        const decoded = await verifySocketToken(token);
        socket.data.userId = decoded.userId;
        console.log(
          "Socket authentication successful for user:",
          decoded.userId
        );
        next();
      } catch (error) {
        console.log("Socket authentication failed:", error);
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log("New socket connection established. Socket ID:", socket.id);
      console.log("Connected user ID:", socket.data.userId);
      this.handleConnection(socket);

      // Test event
      socket.on("test:ping", () => {
        console.log("Received test:ping from socket:", socket.id);
        socket.emit("test:pong", {
          message: "Server is working!",
          timestamp: new Date(),
        });
      });

      // Xử lý các sự kiện
      socket.on("join:conversation", (conversationId: string) => {
        this.handleJoinConversation(socket, conversationId);
      });

      socket.on("leave:conversation", (conversationId: string) => {
        this.handleLeaveConversation(socket, conversationId);
      });

      socket.on(
        "message:send",
        async (data: {
          conversationId: string;
          content: any;
          type: string;
        }) => {
          await this.handleSendMessage(socket, data);
        }
      );

      socket.on(
        "message:read",
        async (data: { conversationId: string; messageId: string }) => {
          await this.handleMessageRead(socket, data);
        }
      );

      socket.on("typing:start", (data: { conversationId: string }) => {
        this.handleTypingStart(socket, data);
      });

      socket.on("typing:stop", (data: { conversationId: string }) => {
        this.handleTypingStop(socket, data);
      });

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleConnection(socket: any) {
    const userId = socket.data.userId;

    // Cập nhật trạng thái online trong database
    await UserModel.findByIdAndUpdate(userId, {
      status: "online",
      lastSeen: new Date(),
    });

    // Thêm user vào danh sách connected
    this.connectedUsers.set(userId, { userId, socketId: socket.id });

    // Lấy danh sách người dùng online từ database
    const onlineUsers = await this.getOnlineUsersFromDB();

    // Gửi danh sách người dùng online cho client mới
    socket.emit("users:online", onlineUsers);

    // Thông báo cho tất cả client khác về người dùng mới online
    socket.broadcast.emit("user:status", {
      userId,
      status: "online",
    });
  }

  private async handleDisconnect(socket: any) {
    const userId = socket.data.userId;

    // Cập nhật trạng thái offline trong database
    await UserModel.findByIdAndUpdate(userId, {
      status: "offline",
      lastSeen: new Date(),
    });

    // Xóa user khỏi danh sách connected
    this.connectedUsers.delete(userId);

    // Thông báo cho tất cả client về người dùng offline
    this.io.emit("user:status", {
      userId,
      status: "offline",
    });
  }

  private handleJoinConversation(socket: any, conversationId: string) {
    socket.join(`conversation:${conversationId}`);
  }

  private handleLeaveConversation(socket: any, conversationId: string) {
    socket.leave(`conversation:${conversationId}`);
  }

  private async handleSendMessage(
    socket: any,
    data: {
      conversationId: string;
      content: any;
      type: string;
    }
  ) {
    try {
      const { conversationId, content, type } = data;
      const userId = socket.data.userId;

      // Tạo tin nhắn mới
      const message = new Message({
        conversation: conversationId,
        sender: userId,
        type,
        content,
        status: "sent",
        readBy: [{ user: userId, readAt: new Date() }],
      });

      await message.save();

      // Cập nhật lastMessage trong conversation
      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: message._id,
          $inc: {
            "unreadCount.$[elem].count": 1,
          },
        },
        {
          arrayFilters: [{ "elem.user": { $ne: userId } }],
        }
      );

      // Gửi tin nhắn đến tất cả người dùng trong cuộc trò chuyện
      this.io.to(`conversation:${conversationId}`).emit("message:new", {
        message,
        conversationId,
      });

      // Gửi thông báo đến người nhận nếu họ không online
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.participants.forEach((participant: any) => {
          if (participant.user.toString() !== userId) {
            const recipientSocket = this.connectedUsers.get(
              participant.user.toString()
            );
            if (!recipientSocket) {
              // Gửi thông báo push ở đây
            }
          }
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleMessageRead(
    socket: any,
    data: {
      conversationId: string;
      messageId: string;
    }
  ) {
    try {
      const { conversationId, messageId } = data;
      const userId = socket.data.userId;

      // Cập nhật trạng thái đã đọc
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      });

      // Cập nhật unreadCount trong conversation
      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: {
            "unreadCount.$[elem].count": 0,
          },
        },
        {
          arrayFilters: [{ "elem.user": userId }],
        }
      );

      // Thông báo cho người gửi
      this.io.to(`conversation:${conversationId}`).emit("message:read", {
        messageId,
        userId,
        conversationId,
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      socket.emit("error", { message: "Failed to mark message as read" });
    }
  }

  private handleTypingStart(socket: any, data: { conversationId: string }) {
    const userId = socket.data.userId;
    socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
      userId,
      conversationId: data.conversationId,
    });
  }

  private handleTypingStop(socket: any, data: { conversationId: string }) {
    const userId = socket.data.userId;
    socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
      userId,
      conversationId: data.conversationId,
    });
  }
}

export default ChatSocket;
