"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReelSchema = new mongoose_1.default.Schema({
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        video: {
            url: {
                type: String,
                required: true
            },
            thumbnail: {
                type: String,
                required: true
            },
            duration: {
                type: Number,
                required: true
            },
            width: {
                type: Number,
                required: true
            },
            height: {
                type: Number,
                required: true
            }
        },
        caption: String,
        music: {
            title: String,
            artist: String,
            url: String
        }
    },
    privacy: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
    },
    views: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
    likes: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    comments: [{
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
            },
            likes: [{
                    user: {
                        type: mongoose_1.default.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }]
        }],
    shares: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            }
        }],
    saves: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            savedAt: {
                type: Date,
                default: Date.now
            }
        }],
    tags: [String],
    mentions: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            indices: [Number]
        }],
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
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});
// Indexes
ReelSchema.index({ author: 1, createdAt: -1 });
ReelSchema.index({ 'location': '2dsphere' });
ReelSchema.index({ tags: 1 });
ReelSchema.index({ 'mentions.user': 1 });
ReelSchema.index({ status: 1 });
ReelSchema.index({ 'content.music.title': 1, 'content.music.artist': 1 });
exports.ReelModel = mongoose_1.default.model("Reel", ReelSchema);
