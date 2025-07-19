"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const conversation_models_1 = require("../models/conversation.models");
const users_models_1 = require("../models/users.models");
const mongoose_1 = __importDefault(require("mongoose"));
class ConversationController {
    // Tạo cuộc trò chuyện mới
    async createConversation(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { type, participants, name, description, avatar } = req.body;
            const creatorId = req.user._id;
            // Kiểm tra loại cuộc trò chuyện
            if (!["direct", "group", "channel", "broadcast"].includes(type)) {
                res.status(400).json({ message: "Invalid conversation type" });
                return;
            }
            // Kiểm tra tên cho group/channel/broadcast
            if (type !== "direct" && !name) {
                res
                    .status(400)
                    .json({ message: "Name is required for group/channel/broadcast" });
                return;
            }
            // Kiểm tra số lượng người tham gia
            if (type === "direct" && participants.length !== 1) {
                res.status(400).json({
                    message: "Direct conversation must have exactly 2 participants",
                });
                return;
            }
            // Kiểm tra người tham gia có tồn tại không
            const participantIds = participants.map((p) => new mongoose_1.default.Types.ObjectId(p));
            const existingUsers = await users_models_1.UserModel.find({
                _id: { $in: participantIds },
            });
            if (existingUsers.length !== participantIds.length) {
                res
                    .status(400)
                    .json({ message: "One or more participants do not exist" });
                return;
            }
            // Tạo mảng người tham gia với vai trò
            const participantsWithRoles = [
                {
                    user: creatorId,
                    role: "owner",
                    joinedAt: new Date(),
                },
                ...participantIds.map((userId) => ({
                    user: userId,
                    role: type === "direct" ? "member" : "member",
                    joinedAt: new Date(),
                })),
            ];
            // Tạo cuộc trò chuyện mới
            const conversation = new conversation_models_1.Conversation({
                type,
                name,
                description,
                avatar,
                participants: participantsWithRoles,
                admins: type !== "direct"
                    ? [{ user: creatorId, role: "owner", assignedAt: new Date() }]
                    : [],
                settings: {
                    allowInvites: type !== "direct",
                    onlyAdminsCanPost: false,
                    slowMode: {
                        enabled: false,
                        interval: 0,
                    },
                    messageRetention: 0,
                    joinMode: "open",
                    messageApproval: false,
                    antiSpam: {
                        enabled: true,
                        maxMessagesPerMinute: 20,
                    },
                },
                metadata: {
                    memberCount: participantsWithRoles.length,
                    onlineCount: 0,
                },
            });
            await conversation.save();
            await conversation.populate("participants.user", "username avatar status");
            res.status(201).json(conversation);
        }
        catch (error) {
            res.status(500).json({ message: "Error creating conversation", error });
        }
    }
    // Lấy danh sách cuộc trò chuyện của người dùng
    async getConversations(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { page = 1, limit = 20, type } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            // Build query object
            const query = {
                "participants.user": req.user._id,
                isDeleted: false,
            };
            // Add type filter if provided
            if (type &&
                ["direct", "group", "channel", "broadcast"].includes(type)) {
                query.type = type;
            }
            const conversations = await conversation_models_1.Conversation.find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("participants.user", "username avatar status")
                .populate("lastMessage");
            const total = await conversation_models_1.Conversation.countDocuments(query);
            res.json({
                conversations,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error getting conversations", error });
        }
    }
    // Lấy thông tin chi tiết cuộc trò chuyện
    async getConversation(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { conversationId } = req.params;
            const conversation = await conversation_models_1.Conversation.findOne({
                _id: conversationId,
                "participants.user": req.user._id,
                isDeleted: false,
            })
                .populate("participants.user", "username avatar status")
                .populate("lastMessage");
            if (!conversation) {
                res.status(404).json({ message: "Conversation not found" });
                return;
            }
            res.json(conversation);
        }
        catch (error) {
            res.status(500).json({ message: "Error getting conversation", error });
        }
    }
    // Cập nhật thông tin cuộc trò chuyện
    async updateConversation(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { conversationId } = req.params;
            const { name, description, avatar, settings } = req.body;
            const conversation = await conversation_models_1.Conversation.findOne({
                _id: conversationId,
                "participants.user": req.user._id,
                isDeleted: false,
            });
            if (!conversation) {
                res.status(404).json({ message: "Conversation not found" });
                return;
            }
            // Kiểm tra quyền chỉnh sửa
            const participant = conversation.participants.find((p) => p.user.toString() === req.user._id.toString());
            if (!participant ||
                !["admin", "moderator", "owner"].includes(participant.role)) {
                res
                    .status(403)
                    .json({ message: "Not authorized to update conversation" });
                return;
            }
            // Cập nhật thông tin
            if (name)
                conversation.name = name;
            if (description)
                conversation.description = description;
            if (avatar)
                conversation.avatar = avatar;
            if (settings)
                conversation.settings = { ...conversation.settings, ...settings };
            await conversation.save();
            res.json(conversation);
        }
        catch (error) {
            res.status(500).json({ message: "Error updating conversation", error });
        }
    }
    // Xóa cuộc trò chuyện
    async deleteConversation(req, res) {
        try {
            if (!req.user?._id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { conversationId } = req.params;
            const conversation = await conversation_models_1.Conversation.findOne({
                _id: conversationId,
                "participants.user": req.user._id,
                isDeleted: false,
            });
            if (!conversation) {
                res.status(404).json({ message: "Conversation not found" });
                return;
            }
            // Kiểm tra quyền xóa
            const participant = conversation.participants.find((p) => p.user.toString() === req.user._id.toString());
            if (!participant || !["admin", "owner"].includes(participant.role)) {
                res
                    .status(403)
                    .json({ message: "Not authorized to delete conversation" });
                return;
            }
            // Đánh dấu là đã xóa
            conversation.isDeleted = true;
            conversation.deletedAt = new Date();
            await conversation.save();
            res.json({ message: "Conversation deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting conversation", error });
        }
    }
}
exports.ConversationController = ConversationController;
