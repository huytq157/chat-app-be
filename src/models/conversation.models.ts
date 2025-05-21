import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  type: "direct" | "group" | "channel" | "broadcast"; // Loại cuộc trò chuyện
  name?: string; // Tên cuộc trò chuyện (bắt buộc cho group/channel/broadcast)
  participants: Array<{
    // Danh sách người tham gia
    user: mongoose.Types.ObjectId; // ID người dùng
    role: "member" | "admin" | "moderator" | "owner"; // Vai trò trong cuộc trò chuyện
    joinedAt: Date; // Thời gian tham gia
    nickname?: string; // Biệt danh trong cuộc trò chuyện
    isMuted: boolean; // Đã tắt thông báo
    isBlocked: boolean; // Bị chặn trong cuộc trò chuyện
    lastReadMessage?: mongoose.Types.ObjectId; // Tin nhắn cuối cùng đã đọc
  }>;
  admins: Array<{
    // Danh sách quản trị viên
    user: mongoose.Types.ObjectId; // ID người dùng
    role: "admin" | "moderator" | "owner"; // Vai trò quản trị
    assignedAt: Date; // Thời gian được bổ nhiệm
  }>;
  lastMessage?: mongoose.Types.ObjectId; // Tin nhắn cuối cùng
  unreadCount: Array<{
    // Số tin nhắn chưa đọc của mỗi người
    user: mongoose.Types.ObjectId; // ID người dùng
    count: number; // Số lượng tin nhắn chưa đọc
  }>;
  isActive: boolean; // Trạng thái hoạt động của cuộc trò chuyện
  avatar?: string; // Ảnh đại diện cuộc trò chuyện
  coverPhoto?: string; // Ảnh bìa cuộc trò chuyện
  description?: string; // Mô tả cuộc trò chuyện
  settings: {
    // Cài đặt cuộc trò chuyện
    allowInvites: boolean; // Cho phép mời người khác
    onlyAdminsCanPost: boolean; // Chỉ admin mới được đăng
    slowMode: {
      // Chế độ chậm
      enabled: boolean; // Bật/tắt chế độ chậm
      interval: number; // Khoảng thời gian giữa các tin nhắn
    };
    messageRetention: number; // Thời gian lưu trữ tin nhắn (ngày)
    joinMode: "open" | "approval" | "invite"; // Chế độ tham gia
    messageApproval: boolean; // Yêu cầu phê duyệt tin nhắn
    antiSpam: {
      // Chống spam
      enabled: boolean; // Bật/tắt chống spam
      maxMessagesPerMinute: number; // Số tin nhắn tối đa mỗi phút
    };
  };
  pinnedMessages: Array<{
    // Tin nhắn đã ghim
    message: mongoose.Types.ObjectId; // ID tin nhắn
    pinnedBy: mongoose.Types.ObjectId; // Người ghim
    pinnedAt: Date; // Thời gian ghim
  }>;
  tags: string[]; // Tags của cuộc trò chuyện
  metadata: {
    // Thông tin bổ sung
    category?: string; // Phân loại
    language?: string; // Ngôn ngữ chính
    location?: {
      // Vị trí
      type: string;
      coordinates: number[];
    };
    isVerified: boolean; // Đã xác minh
    memberCount: number; // Số thành viên
    onlineCount: number; // Số người đang online
  };
  scheduledMessages: Array<{
    // Tin nhắn đã lên lịch
    message: mongoose.Types.ObjectId; // ID tin nhắn
    scheduledFor: Date; // Thời gian gửi
    scheduledBy: mongoose.Types.ObjectId; // Người lên lịch
  }>;
  isArchived: boolean; // Đã lưu trữ
  archivedAt?: Date; // Thời gian lưu trữ
  isDeleted: boolean; // Đã xóa
  deletedAt?: Date; // Thời gian xóa
}

const ConversationSchema: Schema<IConversation> = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group", "channel", "broadcast"],
      required: true,
    },
    name: {
      type: String,
      required: function () {
        return ["group", "channel", "broadcast"].includes(this.type);
      },
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["member", "admin", "moderator", "owner"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        nickname: String,
        isMuted: {
          type: Boolean,
          default: false,
        },
        isBlocked: {
          type: Boolean,
          default: false,
        },
        lastReadMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
    admins: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "moderator", "owner"],
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
    coverPhoto: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    settings: {
      allowInvites: {
        type: Boolean,
        default: true,
      },
      onlyAdminsCanPost: {
        type: Boolean,
        default: false,
      },
      slowMode: {
        enabled: {
          type: Boolean,
          default: false,
        },
        interval: {
          type: Number,
          default: 0,
        },
      },
      messageRetention: {
        type: Number,
        default: 0,
      },
      joinMode: {
        type: String,
        enum: ["open", "approval", "invite"],
        default: "open",
      },
      messageApproval: {
        type: Boolean,
        default: false,
      },
      antiSpam: {
        enabled: {
          type: Boolean,
          default: true,
        },
        maxMessagesPerMinute: {
          type: Number,
          default: 20,
        },
      },
    },
    pinnedMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
        pinnedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        pinnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    metadata: {
      category: String,
      language: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      memberCount: {
        type: Number,
        default: 0,
      },
      onlineCount: {
        type: Number,
        default: 0,
      },
    },
    scheduledMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
        scheduledFor: Date,
        scheduledBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
ConversationSchema.index({ type: 1, "participants.user": 1 });
ConversationSchema.index({ "metadata.location": "2dsphere" });
ConversationSchema.index({ tags: 1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
