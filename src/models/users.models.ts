import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  avatar: string;
  googleId?: string;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
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
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
    },
    googleId: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
