export function registerTypingHandlers(socket: any) {
  socket.on("typing:start", (data: { conversationId: string }) => {
    const userId = socket.data.userId;
    socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
      userId,
      conversationId: data.conversationId,
    });
  });
  socket.on("typing:stop", (data: { conversationId: string }) => {
    const userId = socket.data.userId;
    socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
      userId,
      conversationId: data.conversationId,
    });
  });
} 