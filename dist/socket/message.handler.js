"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageHandlers = registerMessageHandlers;
const message_models_1 = require("../models/message.models");
const conversation_models_1 = require("../models/conversation.models");
function registerMessageHandlers(io, socket, connectedUsers) {
    socket.on("message:send", async (data) => {
        try {
            const { conversationId, content, type } = data;
            const userId = socket.data.userId;
            const message = new message_models_1.Message({
                conversation: conversationId,
                sender: userId,
                type,
                content,
                status: "sent",
                readBy: [{ user: userId, readAt: new Date() }],
            });
            await message.save();
            await conversation_models_1.Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: message._id,
                $inc: { "unreadCount.$[elem].count": 1 },
            }, { arrayFilters: [{ "elem.user": { $ne: userId } }] });
            io.to(`conversation:${conversationId}`).emit("message:new", { message, conversationId });
        }
        catch (error) {
            socket.emit("error", { message: "Failed to send message" });
        }
    });
    socket.on("message:read", async (data) => {
        try {
            const { conversationId, messageId } = data;
            const userId = socket.data.userId;
            await message_models_1.Message.findByIdAndUpdate(messageId, {
                $addToSet: { readBy: { user: userId, readAt: new Date() } },
            });
            await conversation_models_1.Conversation.findByIdAndUpdate(conversationId, { $set: { "unreadCount.$[elem].count": 0 } }, { arrayFilters: [{ "elem.user": userId }] });
            io.to(`conversation:${conversationId}`).emit("message:read", { messageId, userId, conversationId });
        }
        catch (error) {
            socket.emit("error", { message: "Failed to mark message as read" });
        }
    });
}
