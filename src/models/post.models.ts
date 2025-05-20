import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;      // Người đăng
  content: {                            // Nội dung bài đăng
    text?: string;                      // Văn bản
    media?: Array<{                     // Media (ảnh, video)
      url: string;                      // URL media
      type: 'image' | 'video';          // Loại media
      thumbnail?: string;               // Ảnh thu nhỏ
      duration?: number;                // Thời lượng (cho video)
      width?: number;                   // Chiều rộng
      height?: number;                  // Chiều cao
      caption?: string;                 // Chú thích
    }>;
  };
  privacy: 'public' | 'friends' | 'private';  // Quyền riêng tư
  location?: {                          // Vị trí đăng
    type: string;
    coordinates: number[];
    name?: string;
  };
  tags: string[];                       // Hashtags
  mentions: Array<{                     // Người được nhắc đến
    user: mongoose.Types.ObjectId;
    indices: number[];
  }>;
  likes: Array<{                        // Lượt thích
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  comments: Array<{                     // Bình luận
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: Array<{                      // Lượt thích bình luận
      user: mongoose.Types.ObjectId;
      createdAt: Date;
    }>;
    replies: Array<{                    // Trả lời bình luận
      user: mongoose.Types.ObjectId;
      content: string;
      createdAt: Date;
    }>;
  }>;
  shares: Array<{                       // Lượt chia sẻ
    user: mongoose.Types.ObjectId;
    sharedAt: Date;
    platform?: string;                  // Nền tảng chia sẻ
  }>;
  saves: Array<{                        // Lượt lưu
    user: mongoose.Types.ObjectId;
    savedAt: Date;
  }>;
  isEdited: boolean;                    // Đã chỉnh sửa
  editHistory: Array<{                  // Lịch sử chỉnh sửa
    content: any;
    editedAt: Date;
  }>;
  status: 'active' | 'archived' | 'deleted';  // Trạng thái
}

const PostSchema: Schema<IPost> = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      text: {
        type: String,
        trim: true
      },
      media: [{
        url: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true
        },
        thumbnail: String,
        duration: Number,
        width: Number,
        height: Number,
        caption: String
      }]
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      name: String
    },
    tags: [String],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      indices: [Number]
    }],
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      replies: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        content: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    shares: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      },
      platform: String
    }],
    saves: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      savedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editHistory: [{
      content: mongoose.Schema.Types.Mixed,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ 'location': '2dsphere' });
PostSchema.index({ tags: 1 });
PostSchema.index({ 'mentions.user': 1 });
PostSchema.index({ status: 1 });

export const PostModel = mongoose.model<IPost>("Post", PostSchema);