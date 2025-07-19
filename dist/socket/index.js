"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatSocket = exports.initializeSocket = void 0;
const chat_socket_1 = __importDefault(require("./chat.socket"));
let chatSocket;
const initializeSocket = (server) => {
    chatSocket = new chat_socket_1.default(server);
    return chatSocket;
};
exports.initializeSocket = initializeSocket;
const getChatSocket = () => {
    if (!chatSocket) {
        throw new Error("Socket not initialized");
    }
    return chatSocket;
};
exports.getChatSocket = getChatSocket;
