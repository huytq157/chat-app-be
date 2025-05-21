import { Server as HTTPServer } from "http";
import ChatSocket from "./chat.socket";

let chatSocket: ChatSocket;

export const initializeSocket = (server: HTTPServer) => {
  chatSocket = new ChatSocket(server);
  return chatSocket;
};

export const getChatSocket = () => {
  if (!chatSocket) {
    throw new Error("Socket not initialized");
  }
  return chatSocket;
};
