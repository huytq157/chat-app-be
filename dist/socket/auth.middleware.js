"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const verifyToken_1 = require("../middleware/verifyToken");
const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            return next(new Error("Authentication error: No cookies found"));
        }
        const token = cookies
            .split(";")
            .find((c) => c.trim().startsWith("token="))
            ?.split("=")[1];
        if (!token) {
            return next(new Error("Authentication error: No token in cookies"));
        }
        const decoded = await (0, verifyToken_1.verifySocketToken)(token);
        socket.data.userId = decoded.userId;
        next();
    }
    catch (error) {
        next(new Error("Authentication error"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
