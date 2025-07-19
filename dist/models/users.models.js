"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email address is required"],
        validate: {
            validator: function (email) {
                const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return re.test(email);
            },
            message: "Please fill a valid email address",
        },
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: 6,
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    coverPhoto: {
        type: String,
        default: "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    status: {
        type: String,
        enum: ["online", "offline", "away", "busy", "invisible"],
        default: "offline",
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    bio: {
        type: String,
        maxlength: 200,
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
    },
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
    contacts: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            nickname: String,
            addedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    blockedUsers: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            blockedAt: {
                type: Date,
                default: Date.now,
            },
            reason: String,
        },
    ],
    privacy: {
        lastSeen: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone",
        },
        profilePhoto: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone",
        },
        status: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone",
        },
    },
    settings: {
        notifications: {
            messages: {
                type: Boolean,
                default: true,
            },
            groups: {
                type: Boolean,
                default: true,
            },
            calls: {
                type: Boolean,
                default: true,
            },
            mentions: {
                type: Boolean,
                default: true,
            },
        },
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system",
        },
        language: {
            type: String,
            default: "en",
        },
        fontSize: {
            type: Number,
            default: 16,
            min: 12,
            max: 24,
        },
        messagePreview: {
            type: Boolean,
            default: true,
        },
        enterToSend: {
            type: Boolean,
            default: true,
        },
        mediaAutoDownload: {
            type: Boolean,
            default: true,
        },
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: String,
        loginHistory: [
            {
                device: String,
                ip: String,
                location: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        activeSessions: [
            {
                device: String,
                ip: String,
                lastActive: Date,
                token: String,
            },
        ],
    },
    verification: {
        emailVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationExpires: Date,
    },
    socialLinks: [
        {
            platform: String,
            url: String,
        },
    ],
    badges: [
        {
            type: String,
            name: String,
            earnedAt: Date,
        },
    ],
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, {
    timestamps: true,
});
// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ location: "2dsphere" });
exports.UserModel = mongoose_1.default.model("User", UserSchema);
