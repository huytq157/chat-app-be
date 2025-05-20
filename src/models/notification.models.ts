import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;   // Người nhận
  sender: mongoose.Types.ObjectId;      // Người gửi
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention' | 'tag' | 'friend_request' | 'story_mention' | 'reel_mention';  // Loại thông báo
  content: {                            // Nội dung thông báo
    text: string;                       // Văn bản thông báo
    image?: string;                     // Ảnh đại diện
  };
  reference: {                          // Tham chiếu
    type: 'post' | 'comment' | 'story' | 'reel' | 'user';  // Loại tham chiếu
    id: mongoose.Types.ObjectId;        // ID tham chiếu
  };
  isRead: boolean;                      // Đã đọc
  readAt?: Date;                        // Thời gian đọc
  isDeleted: boolean;                   // Đã xóa
  deletedAt?: Date;                     // Thời gian xóa
}

const NotificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'share',
        'follow',
        'mention',
        'tag',
        'friend_request',
        'story_mention',
        'reel_mention'
      ],
      required: true
    },
    content: {
      text: {
        type: String,
        required: true
      },
      image: String
    },
    reference: {
      type: {
        type: String,
        enum: ['post', 'comment', 'story', 'reel', 'user'],
        required: true
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ 'reference.id': 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ isDeleted: 1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);