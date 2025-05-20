import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  owner: mongoose.Types.ObjectId;       // Chủ sở hữu
  name: string;                         // Tên bộ sưu tập
  description?: string;                 // Mô tả
  privacy: 'public' | 'private';        // Quyền riêng tư
  coverImage?: string;                  // Ảnh bìa
  items: Array<{                        // Các mục trong bộ sưu tập
    type: 'post' | 'reel' | 'story';    // Loại mục
    item: mongoose.Types.ObjectId;      // ID mục
    addedAt: Date;                      // Thời gian thêm
  }>;
  followers: Array<{                    // Người theo dõi
    user: mongoose.Types.ObjectId;
    followedAt: Date;
  }>;
  isArchived: boolean;                  // Đã lưu trữ
  archivedAt?: Date;                    // Thời gian lưu trữ
}

const CollectionSchema: Schema<ICollection> = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    coverImage: String,
    items: [{
      type: {
        type: String,
        enum: ['post', 'reel', 'story'],
        required: true
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.type'
      },
      addedAt: {
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
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
CollectionSchema.index({ owner: 1, name: 1 }, { unique: true });
CollectionSchema.index({ privacy: 1 });
CollectionSchema.index({ 'items.item': 1 });
CollectionSchema.index({ 'followers.user': 1 });
CollectionSchema.index({ isArchived: 1 });

export const CollectionModel = mongoose.model<ICollection>("Collection", CollectionSchema);