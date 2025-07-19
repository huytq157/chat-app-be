"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    conversation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "text",
            "image",
            "video",
            "file",
            "audio",
            "voice",
            "location",
            "contact",
            "sticker",
            "gif",
            "poll",
            "system",
            "forwarded",
            "reply",
            "story",
            "live",
            "call",
        ],
        default: "text",
    },
    content: {
        text: {
            type: String,
            trim: true,
        },
        media: {
            url: String,
            thumbnail: String,
            duration: Number,
            size: Number,
            mimeType: String,
            width: Number,
            height: Number,
            caption: String,
            alt: String,
        },
        poll: {
            question: String,
            options: [
                {
                    text: String,
                    votes: [
                        {
                            user: {
                                type: mongoose_1.default.Schema.Types.ObjectId,
                                ref: "User",
                            },
                            votedAt: {
                                type: Date,
                                default: Date.now,
                            },
                        },
                    ],
                },
            ],
            isMultipleChoice: {
                type: Boolean,
                default: false,
            },
            endTime: Date,
            isAnonymous: {
                type: Boolean,
                default: false,
            },
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: function () {
                    return this.type === "location";
                },
            },
            name: String,
            address: String,
        },
        contact: {
            name: String,
            phone: String,
            email: String,
            avatar: String,
        },
        call: {
            type: {
                type: String,
                enum: ["voice", "video"],
                required: function () {
                    return this.type === "call";
                },
            },
            status: {
                type: String,
                enum: ["missed", "answered", "rejected", "busy"],
                required: function () {
                    return this.type === "call";
                },
            },
            duration: Number,
            startTime: Date,
            endTime: Date,
        },
    },
    replyTo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    forwardedFrom: {
        message: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Message",
        },
        conversation: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        forwardedAt: {
            type: Date,
            default: Date.now,
        },
    },
    readBy: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            readAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    reactions: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            emoji: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    isEdited: {
        type: Boolean,
        default: false,
    },
    editHistory: [
        {
            content: mongoose_1.default.Schema.Types.Mixed,
            editedAt: {
                type: Date,
                default: Date.now,
            },
            editedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    metadata: {
        mentions: [
            {
                user: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "User",
                },
                indices: [Number],
            },
        ],
        hashtags: [
            {
                tag: String,
                indices: [Number],
            },
        ],
        links: [
            {
                url: String,
                title: String,
                description: String,
                thumbnail: String,
                indices: [Number],
            },
        ],
        language: String,
        sentiment: {
            type: String,
            enum: ["positive", "negative", "neutral"],
        },
        spamScore: Number,
        encryption: {
            isEncrypted: {
                type: Boolean,
                default: false,
            },
            algorithm: String,
            keyId: String,
        },
    },
    status: {
        type: String,
        enum: ["sending", "sent", "delivered", "read", "failed"],
        default: "sending",
    },
    scheduledFor: Date,
    expiresAt: Date,
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinnedAt: Date,
    pinnedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
// Indexes
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ "metadata.location": "2dsphere" });
MessageSchema.index({ "content.poll.endTime": 1 });
MessageSchema.index({ scheduledFor: 1 });
MessageSchema.index({ expiresAt: 1 });
exports.Message = mongoose_1.default.model("Message", MessageSchema);
