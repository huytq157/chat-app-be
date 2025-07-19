"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const HashtagSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    posts: [{
            post: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Post'
            },
            usedAt: {
                type: Date,
                default: Date.now
            }
        }],
    stories: [{
            story: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Story'
            },
            usedAt: {
                type: Date,
                default: Date.now
            }
        }],
    reels: [{
            reel: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Reel'
            },
            usedAt: {
                type: Date,
                default: Date.now
            }
        }],
    followers: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            followedAt: {
                type: Date,
                default: Date.now
            }
        }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedAt: Date
}, {
    timestamps: true
});
// Indexes
HashtagSchema.index({ name: 1 });
HashtagSchema.index({ 'posts.post': 1 });
HashtagSchema.index({ 'stories.story': 1 });
HashtagSchema.index({ 'reels.reel': 1 });
HashtagSchema.index({ 'followers.user': 1 });
HashtagSchema.index({ isVerified: 1 });
HashtagSchema.index({ isBlocked: 1 });
// Middleware to ensure hashtag name is always lowercase
HashtagSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.name = this.name.toLowerCase();
    }
    next();
});
exports.HashtagModel = mongoose_1.default.model("Hashtag", HashtagSchema);
