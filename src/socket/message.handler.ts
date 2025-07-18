import { Message } from "../models/message.models";
import { Conversation } from "../models/conversation.models";

export function registerMessageHandlers(io: any, socket: any, connectedUsers: Map<string, any>) {
  socket.on("message:send", async (data: { conversationId: string; content: any; type: string }) => {
    try {
      const { conversationId, content, type } = data;
      const userId = socket.data.userId;
      const message = new Message({
        conversation: conversationId,
        sender: userId,
        type,
        content,
        status: "sent",
        readBy: [{ user: userId, readAt: new Date() }],
      });
      await message.save();
      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: message._id,
          $inc: { "unreadCount.$[elem].count": 1 },
        },
        { arrayFilters: [{ "elem.user": { $ne: userId } }] }
      );
      io.to(`conversation:${conversationId}`).emit("message:new", { message, conversationId });
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("message:read", async (data: { conversationId: string; messageId: string }) => {
    try {
      const { conversationId, messageId } = data;
      const userId = socket.data.userId;
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: { user: userId, readAt: new Date() } },
      });
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { "unreadCount.$[elem].count": 0 } },
        { arrayFilters: [{ "elem.user": userId }] }
      );
      io.to(`conversation:${conversationId}`).emit("message:read", { messageId, userId, conversationId });
    } catch (error) {
      socket.emit("error", { message: "Failed to mark message as read" });
    }
  });
} 