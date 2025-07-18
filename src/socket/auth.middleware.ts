import { verifySocketToken } from "../middleware/verifyToken";

export const socketAuthMiddleware = async (socket: any, next: (err?: any) => void) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("Authentication error: No cookies found"));
    }
    const token = cookies
      .split(";")
      .find((c: string) => c.trim().startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      return next(new Error("Authentication error: No token in cookies"));
    }
    const decoded = await verifySocketToken(token);
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
}; 