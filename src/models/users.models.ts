import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  username: string; // Tên đăng nhập, phải là duy nhất
  fullname: string; // Tên đầy đủ của người dùng
  email: string; // Email, phải là duy nhất và hợp lệ
  password: string; // Mật khẩu đã được mã hóa
  avatar: string; // URL ảnh đại diện
  coverPhoto?: string; // URL ảnh bìa profile
  status: "online" | "offline" | "away" | "busy" | "invisible"; // Trạng thái hoạt động
  lastSeen: Date; // Thời gian hoạt động cuối cùng
  bio?: string; // Tiểu sử ngắn
  phoneNumber?: string; // Số điện thoại (tùy chọn)
  dateOfBirth?: Date; // Ngày sinh
  gender?: "male" | "female" | "other" | "prefer_not_to_say"; // Giới tính
  role?: "user" | "admin"; // Vai trò người dùng
  location?: {
    // Vị trí địa lý
    type: string;
    coordinates: number[];
  };
  contacts: Array<{
    // Danh sách liên hệ
    user: mongoose.Types.ObjectId; // ID người dùng
    nickname?: string; // Biệt danh cho liên hệ
    addedAt: Date; // Thời gian thêm vào danh bạ
  }>;
  blockedUsers: Array<{
    // Danh sách người dùng bị chặn
    user: mongoose.Types.ObjectId;
    blockedAt: Date; // Thời gian chặn
    reason?: string; // Lý do chặn
  }>;
  privacy: {
    // Cài đặt quyền riêng tư
    lastSeen: "everyone" | "contacts" | "nobody"; // Ai có thể xem trạng thái hoạt động
    profilePhoto: "everyone" | "contacts" | "nobody"; // Ai có thể xem ảnh đại diện
    status: "everyone" | "contacts" | "nobody"; // Ai có thể xem trạng thái
  };
  settings: {
    // Cài đặt người dùng
    notifications: {
      // Cài đặt thông báo
      messages: boolean; // Thông báo tin nhắn mới
      groups: boolean; // Thông báo từ nhóm
      calls: boolean; // Thông báo cuộc gọi
      mentions: boolean; // Thông báo khi được nhắc đến
    };
    theme: "light" | "dark" | "system"; // Giao diện
    language: string; // Ngôn ngữ
    fontSize: number; // Cỡ chữ
    messagePreview: boolean; // Xem trước tin nhắn
    enterToSend: boolean; // Gửi tin nhắn bằng Enter
    mediaAutoDownload: boolean; // Tự động tải media
  };
  security: {
    // Bảo mật
    twoFactorEnabled: boolean; // Bật xác thực 2 yếu tố
    twoFactorSecret?: string; // Mã bí mật 2FA
    loginHistory: Array<{
      // Lịch sử đăng nhập
      device: string; // Thiết bị
      ip: string; // Địa chỉ IP
      location: string; // Vị trí
      timestamp: Date; // Thời gian
    }>;
    activeSessions: Array<{
      // Phiên đăng nhập hiện tại
      device: string;
      ip: string;
      lastActive: Date;
      token: string;
    }>;
  };
  verification: {
    // Xác thực tài khoản
    emailVerified: boolean; // Đã xác thực email
    phoneVerified: boolean; // Đã xác thực số điện thoại
    verificationToken?: string; // Token xác thực
    verificationExpires?: Date; // Thời hạn token
  };
  socialLinks: Array<{
    // Liên kết mạng xã hội
    platform: string; // Nền tảng
    url: string; // URL profile
  }>;
  badges: Array<{
    // Huy hiệu thành tích
    type: string; // Loại huy hiệu
    name: string; // Tên huy hiệu
    earnedAt: Date; // Thời gian nhận
  }>;
  googleId?: string; // ID Google (cho đăng nhập bằng Google)
  isDeleted: boolean; // Đánh dấu tài khoản đã xóa
  deletedAt?: Date; // Thời gian xóa
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required"],
      validate: {
        validator: function (email: string) {
          const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return re.test(email);
        },
        message: "Please fill a valid email address",
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    coverPhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy", "invisible"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    bio: {
      type: String,
      maxlength: 200,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
    },
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
    contacts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        nickname: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    blockedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        blockedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
    privacy: {
      lastSeen: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      profilePhoto: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      status: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
    },
    settings: {
      notifications: {
        messages: {
          type: Boolean,
          default: true,
        },
        groups: {
          type: Boolean,
          default: true,
        },
        calls: {
          type: Boolean,
          default: true,
        },
        mentions: {
          type: Boolean,
          default: true,
        },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      fontSize: {
        type: Number,
        default: 16,
        min: 12,
        max: 24,
      },
      messagePreview: {
        type: Boolean,
        default: true,
      },
      enterToSend: {
        type: Boolean,
        default: true,
      },
      mediaAutoDownload: {
        type: Boolean,
        default: true,
      },
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      twoFactorSecret: String,
      loginHistory: [
        {
          device: String,
          ip: String,
          location: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      activeSessions: [
        {
          device: String,
          ip: String,
          lastActive: Date,
          token: String,
        },
      ],
    },
    verification: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      verificationToken: String,
      verificationExpires: Date,
    },
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],
    badges: [
      {
        type: String,
        name: String,
        earnedAt: Date,
      },
    ],
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
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
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ location: "2dsphere" });

export const UserModel = mongoose.model<IUser>("User", UserSchema);
