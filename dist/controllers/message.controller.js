"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_models_1 = require("../models/message.models");
const conversation_models_1 = require("../models/conversation.models");
class MessageController {
    // Lấy danh sách tin nhắn của một cuộc trò chuyện
    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const messages = await message_models_1.Message.find({
                conversation: conversationId,
                isDeleted: false,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("sender", "fullname avatar")
                .populate("replyTo")
                .populate({
                path: "readBy.user",
                select: "fullname avatar",
            });
            const total = await message_models_1.Message.countDocuments({
                conversation: conversationId,
                isDeleted: false,
            });
            res.json({
                messages,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error getting messages", error });
        }
    }
    // Gửi tin nhắn mới
    async sendMessage(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { conversationId, content, type = "text" } = req.body;
            const senderId = req.user._id;
            console.log("Sending message with data:", {
                conversationId,
                content,
                type,
                senderId,
            });
            // Kiểm tra xem người dùng có trong cuộc trò chuyện không
            const conversation = await conversation_models_1.Conversation.findOne({
                _id: conversationId,
                "participants.user": senderId,
            });
            if (!conversation) {
                console.log("Conversation not found:", conversationId);
                res.status(404).json({ message: "Conversation not found" });
                return;
            }
            console.log("Found conversation:", conversation._id);
            // Format content based on message type
            let formattedContent = {};
            if (type === "text") {
                formattedContent = { text: content };
            }
            else if (type === "image" || type === "video" || type === "file") {
                formattedContent = { media: content };
            }
            else if (type === "location") {
                formattedContent = { location: content };
            }
            else if (type === "contact") {
                formattedContent = { contact: content };
            }
            else if (type === "call") {
                formattedContent = { call: content };
            }
            else if (type === "poll") {
                formattedContent = { poll: content };
            }
            console.log("Formatted content:", formattedContent);
            const message = new message_models_1.Message({
                conversation: conversationId,
                sender: senderId,
                type,
                content: formattedContent,
            });
            console.log("Created message object:", message);
            await message.save();
            console.log("Message saved successfully");
            // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
            conversation.lastMessage = message._id;
            await conversation.save();
            await message.populate("sender", "fullname avatar");
            // Populate thông tin người gửi
            await message.populate("sender", "username avatar");
            console.log("Populated sender info");
            // Emit socket event
            try {
                const io = req.app.get("io");
                if (io) {
                    io.to(conversationId).emit("new_message", message);
                    console.log("Emitted socket event");
                }
                else {
                    console.log("Socket.IO not initialized");
                }
            }
            catch (socketError) {
                console.error("Socket error:", socketError);
            }
            res.status(201).json(message);
        }
        catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({
                message: "Error sending message",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    // Đánh dấu tin nhắn đã đọc
    async markAsRead(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { messageId } = req.params;
            const userId = req.user._id;
            const message = await message_models_1.Message.findById(messageId);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            // Kiểm tra xem người dùng đã đọc tin nhắn chưa
            const alreadyRead = message.readBy.some((read) => read.user.toString() === userId.toString());
            if (!alreadyRead) {
                message.readBy.push({
                    user: userId,
                    readAt: new Date(),
                });
                await message.save();
                // Emit socket event
                req.app
                    .get("io")
                    .to(message.conversation.toString())
                    .emit("message_read", {
                    messageId,
                    userId,
                });
            }
            res.json({ message: "Message marked as read" });
        }
        catch (error) {
            res.status(500).json({ message: "Error marking message as read", error });
        }
    }
    // Xóa tin nhắn
    async deleteMessage(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { messageId } = req.params;
            const userId = req.user._id;
            const message = await message_models_1.Message.findById(messageId);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            // Kiểm tra xem người dùng có quyền xóa tin nhắn không
            if (message.sender.toString() !== userId.toString()) {
                res.status(403).json({ message: "Not authorized" });
                return;
            }
            message.isDeleted = true;
            message.deletedAt = new Date();
            message.deletedBy = userId;
            await message.save();
            // Emit socket event
            try {
                const io = req.app.get("io");
                if (io) {
                    io.to(message.conversation.toString()).emit("message_deleted", {
                        messageId,
                        userId,
                    });
                }
            }
            catch (socketError) {
                console.error("Socket error:", socketError);
                // Không throw error vì tin nhắn đã được xóa thành công
            }
            res.json({ message: "Message deleted" });
        }
        catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({
                message: "Error deleting message",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    // Chỉnh sửa tin nhắn
    async editMessage(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { messageId } = req.params;
            const { content } = req.body;
            const userId = req.user._id;
            const message = await message_models_1.Message.findById(messageId);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            // Kiểm tra xem người dùng có quyền chỉnh sửa tin nhắn không
            if (message.sender.toString() !== userId.toString()) {
                res.status(403).json({ message: "Not authorized" });
                return;
            }
            // Lưu lịch sử chỉnh sửa
            message.editHistory.push({
                content: message.content,
                editedAt: new Date(),
                editedBy: userId,
            });
            message.content = content;
            message.isEdited = true;
            await message.save();
            // Emit socket event
            req.app
                .get("io")
                .to(message.conversation.toString())
                .emit("message_edited", {
                messageId,
                content,
                userId,
            });
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ message: "Error editing message", error });
        }
    }
    async addReaction(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { messageId } = req.params;
            const { emoji } = req.body;
            const userId = req.user._id;
            const message = await message_models_1.Message.findById(messageId);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            // Kiểm tra xem người dùng đã phản ứng chưa
            const existingReaction = message.reactions.find((reaction) => reaction.user.toString() === userId.toString());
            if (existingReaction) {
                existingReaction.emoji = emoji;
            }
            else {
                message.reactions.push({
                    user: userId,
                    emoji,
                    createdAt: new Date(),
                });
            }
            await message.save();
            // Emit socket event
            req.app
                .get("io")
                .to(message.conversation.toString())
                .emit("message_reaction", {
                messageId,
                reaction: {
                    user: userId,
                    emoji,
                },
            });
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ message: "Error adding reaction", error });
        }
    }
    async removeReaction(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { messageId, reactionId } = req.params;
            const userId = req.user._id;
            const message = await message_models_1.Message.findById(messageId);
            if (!message) {
                res.status(404).json({ message: "Message not found" });
                return;
            }
            // Xóa phản ứng
            message.reactions = message.reactions.filter((reaction) => reaction.user.toString() !== userId.toString());
            await message.save();
            // Emit socket event
            req.app
                .get("io")
                .to(message.conversation.toString())
                .emit("message_reaction_removed", {
                messageId,
                userId,
            });
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ message: "Error removing reaction", error });
        }
    }
}
exports.MessageController = MessageController;
