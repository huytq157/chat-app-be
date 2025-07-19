"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["direct", "group", "channel", "broadcast"],
        required: true,
    },
    name: {
        type: String,
        required: function () {
            return ["group", "channel", "broadcast"].includes(this.type);
        },
    },
    participants: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ["member", "admin", "moderator", "owner"],
                default: "member",
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
            nickname: String,
            isMuted: {
                type: Boolean,
                default: false,
            },
            isBlocked: {
                type: Boolean,
                default: false,
            },
            lastReadMessage: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Message",
            },
        },
    ],
    admins: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            role: {
                type: String,
                enum: ["admin", "moderator", "owner"],
                required: true,
            },
            assignedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    unreadCount: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            count: {
                type: Number,
                default: 0,
            },
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    avatar: {
        type: String,
    },
    coverPhoto: {
        type: String,
    },
    description: {
        type: String,
        maxlength: 500,
    },
    settings: {
        allowInvites: {
            type: Boolean,
            default: true,
        },
        onlyAdminsCanPost: {
            type: Boolean,
            default: false,
        },
        slowMode: {
            enabled: {
                type: Boolean,
                default: false,
            },
            interval: {
                type: Number,
                default: 0,
            },
        },
        messageRetention: {
            type: Number,
            default: 0,
        },
        joinMode: {
            type: String,
            enum: ["open", "approval", "invite"],
            default: "open",
        },
        messageApproval: {
            type: Boolean,
            default: false,
        },
        antiSpam: {
            enabled: {
                type: Boolean,
                default: true,
            },
            maxMessagesPerMinute: {
                type: Number,
                default: 20,
            },
        },
    },
    pinnedMessages: [
        {
            message: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Message",
            },
            pinnedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            pinnedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    tags: [String],
    metadata: {
        category: String,
        language: String,
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        memberCount: {
            type: Number,
            default: 0,
        },
        onlineCount: {
            type: Number,
            default: 0,
        },
    },
    scheduledMessages: [
        {
            message: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Message",
            },
            scheduledFor: Date,
            scheduledBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    isArchived: {
        type: Boolean,
        default: false,
    },
    archivedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, {
    timestamps: true,
});
// Indexes
ConversationSchema.index({ type: 1, "participants.user": 1 });
ConversationSchema.index({ "metadata.location": "2dsphere" });
ConversationSchema.index({ tags: 1 });
exports.Conversation = mongoose_1.default.model("Conversation", ConversationSchema);
