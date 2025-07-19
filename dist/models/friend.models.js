"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const FriendSchema = new mongoose_1.default.Schema({
    user1: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'blocked'],
        default: 'pending'
    },
    actionBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actionAt: {
        type: Date,
        default: Date.now
    },
    isCloseFriend: {
        type: Boolean,
        default: false
    },
    notes: String,
    tags: [String]
}, {
    timestamps: true
});
// Indexes
FriendSchema.index({ user1: 1, user2: 1 }, { unique: true });
FriendSchema.index({ status: 1 });
FriendSchema.index({ actionBy: 1 });
FriendSchema.index({ isCloseFriend: 1 });
FriendSchema.index({ tags: 1 });
// Middleware to ensure user1 is always the smaller ID
FriendSchema.pre('save', function (next) {
    if (this.user1.toString() > this.user2.toString()) {
        const temp = this.user1;
        this.user1 = this.user2;
        this.user2 = temp;
    }
    next();
});
exports.FriendModel = mongoose_1.default.model("Friend", FriendSchema);
