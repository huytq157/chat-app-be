export function registerConversationHandlers(socket: any) {
  socket.on("join:conversation", (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });
  socket.on("leave:conversation", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
} 