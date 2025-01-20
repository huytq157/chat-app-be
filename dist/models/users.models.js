"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
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
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    googleId: { type: String, unique: true, sparse: true },
}, {
    timestamps: true,
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
