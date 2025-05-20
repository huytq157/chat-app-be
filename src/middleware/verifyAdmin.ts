import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/users.models";


dotenv.config();

const JWT_SECRET = process.env.PASSJWT;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Không có quyền truy cập! Vui lòng đăng nhập.",
      });
      return;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Kiểm tra xem token có phải của admin không
      if (!decoded.role || decoded.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập vào trang admin!",
        });
        return;
      }

      // Thêm thông tin admin vào request
      req.user = {
        id: decoded.userId,
        role: decoded.role
      } as IUser;

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
      });
      return;
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xác thực!",
    });
  }
}; 