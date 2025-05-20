import mongoose, { Schema, Document } from "mongoose";

export interface IHashtag extends Document {
  name: string;                         // Tên hashtag
  description?: string;                 // Mô tả
  posts: Array<{                        // Bài đăng sử dụng
    post: mongoose.Types.ObjectId;
    usedAt: Date;
  }>;
  stories: Array<{                      // Story sử dụng
    story: mongoose.Types.ObjectId;
    usedAt: Date;
  }>;
  reels: Array<{                        // Reel sử dụng
    reel: mongoose.Types.ObjectId;
    usedAt: Date;
  }>;
  followers: Array<{                    // Người theo dõi
    user: mongoose.Types.ObjectId;
    followedAt: Date;
  }>;
  isVerified: boolean;                  // Đã xác minh
  verifiedAt?: Date;                    // Thời gian xác minh
  isBlocked: boolean;                   // Đã chặn
  blockedAt?: Date;                     // Thời gian chặn
}

const HashtagSchema: Schema<IHashtag> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true
    },
    posts: [{
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }],
    stories: [{
      story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reels: [{
      reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }],
    followers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      followedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
HashtagSchema.index({ name: 1 });
HashtagSchema.index({ 'posts.post': 1 });
HashtagSchema.index({ 'stories.story': 1 });
HashtagSchema.index({ 'reels.reel': 1 });
HashtagSchema.index({ 'followers.user': 1 });
HashtagSchema.index({ isVerified: 1 });
HashtagSchema.index({ isBlocked: 1 });

// Middleware to ensure hashtag name is always lowercase
HashtagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase();
  }
  next();
});

export const HashtagModel = mongoose.model<IHashtag>("Hashtag", HashtagSchema);