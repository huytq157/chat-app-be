"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySocketToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const JWT_SECRET = env_1.env.PASSJWT;
const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Authentication required!",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = new mongoose_1.default.Types.ObjectId(decoded.userId);
        // Set user in request
        req.user = {
            _id: userId,
        };
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token!",
        });
    }
};
exports.verifyToken = verifyToken;
const verifySocketToken = async (token) => {
    if (!token) {
        throw new Error("Authentication required!");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error("Invalid or expired token!");
    }
};
exports.verifySocketToken = verifySocketToken;
