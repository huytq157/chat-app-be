import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { IUser } from "../models/users.models";
import mongoose from "mongoose";

const JWT_SECRET = env.PASSJWT;

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends IUser {
      _id: mongoose.Types.ObjectId;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required!",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = new mongoose.Types.ObjectId(decoded.userId);

    // Set user in request
    req.user = {
      _id: userId,
    } as Express.User;

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};

export const verifySocketToken = async (
  token: string
): Promise<{ userId: string }> => {
  if (!token) {
    throw new Error("Authentication required!");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token!");
  }
};
