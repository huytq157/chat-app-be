"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
exports.handleDisconnect = handleDisconnect;
const users_models_1 = require("../models/users.models");
async function handleConnection(io, socket, connectedUsers) {
    const userId = socket.data.userId;
    await users_models_1.UserModel.findByIdAndUpdate(userId, {
        status: "online",
        lastSeen: new Date(),
    });
    connectedUsers.set(userId, { userId, socketId: socket.id });
    // Lấy danh sách người dùng online từ database
    const onlineUsers = await users_models_1.UserModel.find({ status: "online" }, { _id: 1 }).lean();
    socket.emit("users:online", onlineUsers.map((user) => ({ userId: user._id.toString(), status: "online" })));
    socket.broadcast.emit("user:status", { userId, status: "online" });
}
async function handleDisconnect(io, socket, connectedUsers) {
    const userId = socket.data.userId;
    await users_models_1.UserModel.findByIdAndUpdate(userId, {
        status: "offline",
        lastSeen: new Date(),
    });
    connectedUsers.delete(userId);
    io.emit("user:status", { userId, status: "offline" });
}
