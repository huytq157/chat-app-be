"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTypingHandlers = registerTypingHandlers;
function registerTypingHandlers(socket) {
    socket.on("typing:start", (data) => {
        const userId = socket.data.userId;
        socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
            userId,
            conversationId: data.conversationId,
        });
    });
    socket.on("typing:stop", (data) => {
        const userId = socket.data.userId;
        socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
            userId,
            conversationId: data.conversationId,
        });
    });
}
