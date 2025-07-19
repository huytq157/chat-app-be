"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConversationHandlers = registerConversationHandlers;
function registerConversationHandlers(socket) {
    socket.on("join:conversation", (conversationId) => {
        socket.join(`conversation:${conversationId}`);
    });
    socket.on("leave:conversation", (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
    });
}
