import mongoose, { Schema, Document } from "mongoose";

interface IGroup extends Document {
  name: string;
  members: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  avatar: string;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>("Group", GroupSchema);
