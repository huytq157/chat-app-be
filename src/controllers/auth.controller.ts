import express, { Request, Response, NextFunction } from "express";
import { IUser, UserModel } from "../models/users.models";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passport from "passport";
dotenv.config();

const JWT_SECRET = process.env.PASSJWT;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, fullname, password, avatar } = req.body;

    if (!email || !password || !fullname || !avatar) {
      res.status(400).json({
        success: false,
        message: "Missing parameters!",
      });
      return;
    }

    const userExist = await UserModel.findOne({ email });

    if (userExist) {
      res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
      return;
    }

    const hashPassword = await argon2.hash(password);

    const newUser = new UserModel({
      fullname,
      email,
      password: hashPassword,
      avatar,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email?: string; password?: string } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Missing parameters!",
      });
      return;
    }

    const findUser = await UserModel.findOne({ email });
    if (!findUser) {
      res.status(400).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
      return;
    }

    if (!findUser.password) {
      res.status(400).json({
        success: false,
        message: "Password not set for this user!",
      });
      return;
    }

    const checkPass = await argon2.verify(findUser.password, password);
    if (!checkPass) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu không đúng!",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: findUser._id,
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    });

    const userInfo = {
      id: findUser._id,
      email: findUser.email,
      fullname: findUser.fullname,
      avatar: findUser.avatar,
      token,
    };

    res.status(200).json({
      success: true,
      message: "Login success!",
      data: userInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful!",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
      return;
    }

    // Giải mã token và lấy userId
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    // Trả về thông tin người dùng
    const userInfo = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      avatar: user.avatar,
    };

    res.status(200).json({
      success: true,
      message: "Successfully!",
      data: userInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { email, ...updateData } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User không tồn tại!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ!",
    });
  }
};

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, q = "" } = req.query;

    // Chuyển đổi `page` và `limit` thành số nguyên
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Tạo điều kiện tìm kiếm
    const searchQuery = q
      ? {
          $or: [
            { fullname: { $regex: q, $options: "i" } }, // Tìm kiếm theo fullname
            { email: { $regex: q, $options: "i" } }, // Tìm kiếm theo email
          ],
        }
      : {};

    // Tính toán tổng số người dùng
    const totalUsers = await UserModel.countDocuments(searchQuery);

    // Lấy dữ liệu người dùng với phân trang
    const users = await UserModel.find(searchQuery, "-password")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    if (!users || users.length === 0) {
      res.status(404).json({
        success: false,
        message: "Không có người dùng nào!",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công!",
      data: {
        users,
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ!",
    });
  }
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = [
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Callback hit!");
    next();
  },
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    const user = req.user as IUser;

    const token = jwt.sign(
      { userId: user._id },
      process.env.PASSJWT as string,
      { expiresIn: "12h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    });
    const redirectUrl = process.env.FRONT_END_URL as string;
    res.redirect(redirectUrl);
  },
];
