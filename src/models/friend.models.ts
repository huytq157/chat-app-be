import mongoose, { Schema, Document } from "mongoose";

export interface IFriend extends Document {
  user1: mongoose.Types.ObjectId;       // Người dùng 1
  user2: mongoose.Types.ObjectId;       // Người dùng 2
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';  // Trạng thái
  actionBy: mongoose.Types.ObjectId;    // Người thực hiện hành động cuối
  actionAt: Date;                       // Thời gian hành động cuối
  isCloseFriend: boolean;               // Bạn thân
  notes?: string;                       // Ghi chú
  tags: string[];                       // Nhãn
}

const FriendSchema: Schema<IFriend> = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending'
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actionAt: {
      type: Date,
      default: Date.now
    },
    isCloseFriend: {
      type: Boolean,
      default: false
    },
    notes: String,
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Indexes
FriendSchema.index({ user1: 1, user2: 1 }, { unique: true });
FriendSchema.index({ status: 1 });
FriendSchema.index({ actionBy: 1 });
FriendSchema.index({ isCloseFriend: 1 });
FriendSchema.index({ tags: 1 });

// Middleware to ensure user1 is always the smaller ID
FriendSchema.pre('save', function(next) {
  if (this.user1.toString() > this.user2.toString()) {
    const temp = this.user1;
    this.user1 = this.user2;
    this.user2 = temp;
  }
  next();
});

export const FriendModel = mongoose.model<IFriend>("Friend", FriendSchema);