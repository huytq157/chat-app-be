"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CollectionSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    coverImage: String,
    items: [{
            type: {
                type: String,
                enum: ['post', 'reel', 'story'],
                required: true
            },
            item: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
                refPath: 'items.type'
            },
            addedAt: {
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
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date
}, {
    timestamps: true
});
// Indexes
CollectionSchema.index({ owner: 1, name: 1 }, { unique: true });
CollectionSchema.index({ privacy: 1 });
CollectionSchema.index({ 'items.item': 1 });
CollectionSchema.index({ 'followers.user': 1 });
CollectionSchema.index({ isArchived: 1 });
exports.CollectionModel = mongoose_1.default.model("Collection", CollectionSchema);
