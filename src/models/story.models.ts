import mongoose, { Schema, Document } from "mongoose";

export interface IStory extends Document {
  author: mongoose.Types.ObjectId;      // Người đăng
  content: {                            // Nội dung
    type: 'image' | 'video' | 'text';   // Loại nội dung
    url?: string;                       // URL media
    text?: string;                      // Văn bản
    background?: string;                // Màu nền (cho text)
    font?: string;                      // Font chữ
  };
  privacy: 'public' | 'friends' | 'close_friends';  // Quyền riêng tư
  viewers: Array<{                      // Người xem
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
  }>;
  reactions: Array<{                    // Phản ứng
    user: mongoose.Types.ObjectId;
    emoji: string;
    createdAt: Date;
  }>;
  replies: Array<{                      // Trả lời
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  expiresAt: Date;                      // Thời gian hết hạn
  music?: {                             // Nhạc nền
    title: string;
    artist: string;
    url: string;
  };
  location?: {                          // Vị trí
    type: string;
    coordinates: number[];
    name?: string;
  };
  mentions: Array<{                     // Người được nhắc đến
    user: mongoose.Types.ObjectId;
    indices: number[];
  }>;
  hashtags: string[];                   // Hashtags
}

const StorySchema: Schema<IStory> = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: {
        type: String,
        enum: ['image', 'video', 'text'],
        required: true
      },
      url: String,
      text: String,
      background: String,
      font: String
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'close_friends'],
      default: 'friends'
    },
    viewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: {
        type: String,
        required: true
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
    }],
    expiresAt: {
      type: Date,
      required: true,
      default: function() {
        // Mặc định hết hạn sau 24 giờ
        const date = new Date();
        date.setHours(date.getHours() + 24);
        return date;
      }
    },
    music: {
      title: String,
      artist: String,
      url: String
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
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      indices: [Number]
    }],
    hashtags: [String]
  },
  {
    timestamps: true
  }
);

// Indexes
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ expiresAt: 1 });
StorySchema.index({ 'location': '2dsphere' });
StorySchema.index({ 'mentions.user': 1 });
StorySchema.index({ hashtags: 1 });
StorySchema.index({ privacy: 1 });

// Middleware để tự động xóa story hết hạn
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware để kiểm tra nội dung phù hợp với loại
StorySchema.pre('save', function(next) {
  if (this.content.type === 'text' && !this.content.text) {
    next(new Error('Text content is required for text type story'));
  } else if ((this.content.type === 'image' || this.content.type === 'video') && !this.content.url) {
    next(new Error('URL is required for media type story'));
  } else {
    next();
  }
});

export const StoryModel = mongoose.model<IStory>("Story", StorySchema);