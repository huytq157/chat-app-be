import mongoose, { Schema, Document } from "mongoose";

export interface IReel extends Document {
  author: mongoose.Types.ObjectId;      // Người đăng
  content: {                            // Nội dung
    video: {                            // Video
      url: string;                      // URL video
      thumbnail: string;                // Ảnh thu nhỏ
      duration: number;                 // Thời lượng
      width: number;                    // Chiều rộng
      height: number;                   // Chiều cao
    };
    caption?: string;                   // Chú thích
    music?: {                           // Nhạc nền
      title: string;
      artist: string;
      url: string;
    };
  };
  privacy: 'public' | 'friends' | 'private';  // Quyền riêng tư
  views: Array<{                        // Lượt xem
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
  }>;
  likes: Array<{                        // Lượt thích
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  comments: Array<{                     // Bình luận
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: Array<{
      user: mongoose.Types.ObjectId;
      createdAt: Date;
    }>;
  }>;
  shares: Array<{                       // Lượt chia sẻ
    user: mongoose.Types.ObjectId;
    sharedAt: Date;
  }>;
  saves: Array<{                        // Lượt lưu
    user: mongoose.Types.ObjectId;
    savedAt: Date;
  }>;
  tags: string[];                       // Hashtags
  mentions: Array<{                     // Người được nhắc đến
    user: mongoose.Types.ObjectId;
    indices: number[];
  }>;
  location?: {                          // Vị trí
    type: string;
    coordinates: number[];
    name?: string;
  };
  status: 'active' | 'archived' | 'deleted';  // Trạng thái
}

const ReelSchema: Schema<IReel> = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      video: {
        url: {
          type: String,
          required: true
        },
        thumbnail: {
          type: String,
          required: true
        },
        duration: {
          type: Number,
          required: true
        },
        width: {
          type: Number,
          required: true
        },
        height: {
          type: Number,
          required: true
        }
      },
      caption: String,
      music: {
        title: String,
        artist: String,
        url: String
      }
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    views: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
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
      }
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
    tags: [String],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      indices: [Number]
    }],
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
ReelSchema.index({ author: 1, createdAt: -1 });
ReelSchema.index({ 'location': '2dsphere' });
ReelSchema.index({ tags: 1 });
ReelSchema.index({ 'mentions.user': 1 });
ReelSchema.index({ status: 1 });
ReelSchema.index({ 'content.music.title': 1, 'content.music.artist': 1 });

export const ReelModel = mongoose.model<IReel>("Reel", ReelSchema);