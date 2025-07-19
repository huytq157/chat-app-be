"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const StorySchema = new mongoose_1.default.Schema({
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: {
            type: String,
            enum: ['image', 'video', 'text'],
            required: true
        },
        url: String,
        text: String,
        background: String,
        font: String
    },
    privacy: {
        type: String,
        enum: ['public', 'friends', 'close_friends'],
        default: 'friends'
    },
    viewers: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
    reactions: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            emoji: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    replies: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    expiresAt: {
        type: Date,
        required: true,
        default: function () {
            // Mặc định hết hạn sau 24 giờ
            const date = new Date();
            date.setHours(date.getHours() + 24);
            return date;
        }
    },
    music: {
        title: String,
        artist: String,
        url: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        name: String
    },
    mentions: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            indices: [Number]
        }],
    hashtags: [String]
}, {
    timestamps: true
});
// Indexes
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ expiresAt: 1 });
StorySchema.index({ 'location': '2dsphere' });
StorySchema.index({ 'mentions.user': 1 });
StorySchema.index({ hashtags: 1 });
StorySchema.index({ privacy: 1 });
// Middleware để tự động xóa story hết hạn
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Middleware để kiểm tra nội dung phù hợp với loại
StorySchema.pre('save', function (next) {
    if (this.content.type === 'text' && !this.content.text) {
        next(new Error('Text content is required for text type story'));
    }
    else if ((this.content.type === 'image' || this.content.type === 'video') && !this.content.url) {
        next(new Error('URL is required for media type story'));
    }
    else {
        next();
    }
});
exports.StoryModel = mongoose_1.default.model("Story", StorySchema);
