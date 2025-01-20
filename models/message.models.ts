import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  messageType: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
    messageType: { type: String, default: "text" },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
