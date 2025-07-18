import { UserModel } from "../models/users.models";

export async function handleConnection(io: any, socket: any, connectedUsers: Map<string, any>) {
  const userId = socket.data.userId;
  await UserModel.findByIdAndUpdate(userId, {
    status: "online",
    lastSeen: new Date(),
  });
  connectedUsers.set(userId, { userId, socketId: socket.id });
  // Lấy danh sách người dùng online từ database
  const onlineUsers = await UserModel.find({ status: "online" }, { _id: 1 }).lean();
  socket.emit("users:online", onlineUsers.map((user) => ({ userId: user._id.toString(), status: "online" })));
  socket.broadcast.emit("user:status", { userId, status: "online" });
}

export async function handleDisconnect(io: any, socket: any, connectedUsers: Map<string, any>) {
  const userId = socket.data.userId;
  await UserModel.findByIdAndUpdate(userId, {
    status: "offline",
    lastSeen: new Date(),
  });
  connectedUsers.delete(userId);
  io.emit("user:status", { userId, status: "offline" });
} 