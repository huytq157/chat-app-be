"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'like',
            'comment',
            'share',
            'follow',
            'mention',
            'tag',
            'friend_request',
            'story_mention',
            'reel_mention'
        ],
        required: true
    },
    content: {
        text: {
            type: String,
            required: true
        },
        image: String
    },
    reference: {
        type: {
            type: String,
            enum: ['post', 'comment', 'story', 'reel', 'user'],
            required: true
        },
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});
// Indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ 'reference.id': 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ isDeleted: 1 });
exports.NotificationModel = mongoose_1.default.model("Notification", NotificationSchema);
