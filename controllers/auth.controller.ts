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
