"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PostSchema = new mongoose_1.default.Schema({
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        text: {
            type: String,
            trim: true
        },
        media: [{
                url: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    enum: ['image', 'video'],
                    required: true
                },
                thumbnail: String,
                duration: Number,
                width: Number,
                height: Number,
                caption: String
            }]
    },
    privacy: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
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
    tags: [String],
    mentions: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            indices: [Number]
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
            },
            platform: String
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
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
            content: mongoose_1.default.Schema.Types.Mixed,
            editedAt: {
                type: Date,
                default: Date.now
            }
        }],
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});
// Indexes
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ 'location': '2dsphere' });
PostSchema.index({ tags: 1 });
PostSchema.index({ 'mentions.user': 1 });
PostSchema.index({ status: 1 });
exports.PostModel = mongoose_1.default.model("Post", PostSchema);
