"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = exports.googleAuthCallback = exports.googleAuth = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = exports.loginLimiter = void 0;
const users_models_1 = require("../models/users.models");
const argon2 = __importStar(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const JWT_SECRET = process.env.PASSJWT;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10
});
const register = async (req, res, next) => {
    try {
        const { username, email, fullname, password } = req.body;
        if (!username || !email || !password || !fullname) {
            res.status(400).json({
                success: false,
                message: "Missing required parameters!",
            });
            return;
        }
        // Kiểm tra username và email đã tồn tại
        const existingUser = await users_models_1.UserModel.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: existingUser.email === email ? "Email đã tồn tại" : "Username đã tồn tại",
            });
            return;
        }
        // Validate username
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            res.status(400).json({
                success: false,
                message: "Username phải từ 3-20 ký tự, chỉ bao gồm chữ cái, số và dấu gạch dưới"
            });
            return;
        }
        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({
                success: false,
                message: "Password phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
            });
            return;
        }
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
            return;
        }
        const hashPassword = await argon2.hash(password);
        const newUser = new users_models_1.UserModel({
            username,
            fullname,
            email,
            password: hashPassword,
            avatar: "https://res.cloudinary.com/dkbothcn5/image/upload/v1727074201/images.jpg",
            status: 'offline',
            lastSeen: new Date(),
            privacy: {
                lastSeen: 'everyone',
                profilePhoto: 'everyone',
                status: 'everyone'
            },
            settings: {
                notifications: {
                    messages: true,
                    groups: true,
                    calls: true,
                    mentions: true
                },
                theme: 'system',
                language: 'en',
                fontSize: 16,
                messagePreview: true,
                enterToSend: true,
                mediaAutoDownload: true
            }
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullname: newUser.fullname,
                avatar: newUser.avatar
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Missing parameters!",
            });
            return;
        }
        const findUser = await users_models_1.UserModel.findOne({ email });
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
        // Cập nhật trạng thái người dùng
        findUser.status = 'online';
        findUser.lastSeen = new Date();
        await findUser.save();
        const token = jsonwebtoken_1.default.sign({
            userId: findUser._id,
        }, JWT_SECRET, { expiresIn: "12h" });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: findUser._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 12 * 60 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const userInfo = {
            id: findUser._id,
            username: findUser.username,
            email: findUser.email,
            fullname: findUser.fullname,
            avatar: findUser.avatar,
            status: findUser.status,
            lastSeen: findUser.lastSeen,
            settings: findUser.settings,
            privacy: findUser.privacy
        };
        res.status(200).json({
            success: true,
            message: "Login success!",
            data: userInfo,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập!",
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const isAdmin = decoded.role === "admin";
            if (!isAdmin && userId) {
                // Cập nhật trạng thái người dùng khi logout (chỉ cho user thường)
                await users_models_1.UserModel.findByIdAndUpdate(userId, {
                    status: 'offline',
                    lastSeen: new Date()
                });
            }
            // Xóa cookies với các options bảo mật
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/",
                domain: process.env.COOKIE_DOMAIN || undefined
            };
            // Xóa token và refreshToken
            res.clearCookie("token", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            // Nếu là admin, thêm thông tin vào response
            if (isAdmin) {
                res.status(200).json({
                    success: true,
                    message: "Đăng xuất admin thành công!",
                    data: {
                        role: "admin",
                        logoutTime: new Date().toISOString()
                    }
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: "Đăng xuất thành công!",
                    data: {
                        logoutTime: new Date().toISOString()
                    }
                });
            }
        }
        catch (jwtError) {
            // Token không hợp lệ hoặc hết hạn, vẫn cho phép logout
            console.log("Token invalid or expired during logout");
            // Xóa cookies ngay cả khi token không hợp lệ
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/",
                domain: process.env.COOKIE_DOMAIN || undefined
            };
            res.clearCookie("token", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            res.status(200).json({
                success: true,
                message: "Đăng xuất thành công!",
                data: {
                    logoutTime: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ!",
        });
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const user = await users_models_1.UserModel.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        const userInfo = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            avatar: user.avatar,
            coverPhoto: user.coverPhoto,
            status: user.status,
            lastSeen: user.lastSeen,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            contacts: user.contacts,
            privacy: user.privacy,
            settings: user.settings,
            socialLinks: user.socialLinks,
            badges: user.badges
        };
        res.status(200).json({
            success: true,
            message: "Successfully!",
            data: userInfo,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        // Không cho phép cập nhật một số trường nhạy cảm
        delete updateData.password;
        delete updateData.email;
        delete updateData.username;
        delete updateData.googleId;
        delete updateData.isDeleted;
        delete updateData.deletedAt;
        const updatedUser = await users_models_1.UserModel.findByIdAndUpdate(userId, { $set: updateData }, {
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
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ!",
        });
    }
};
exports.updateProfile = updateProfile;
exports.googleAuth = passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
});
exports.googleAuthCallback = [
    (req, res, next) => {
        console.log("Callback hit!");
        next();
    },
    passport_1.default.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const user = req.user;
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.PASSJWT, { expiresIn: "12h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 12 * 60 * 60 * 1000,
        });
        const redirectUrl = process.env.FRONT_END_URL;
        res.redirect(redirectUrl);
    },
];
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin đăng nhập!",
            });
            return;
        }
        // Kiểm tra thông tin đăng nhập admin cố định
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345678";
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            res.status(401).json({
                success: false,
                message: "Thông tin đăng nhập không chính xác!",
            });
            return;
        }
        // Tạo token cho admin với thời gian ngắn hơn
        const token = jsonwebtoken_1.default.sign({
            userId: "admin",
            role: "admin",
            loginTime: new Date().toISOString()
        }, JWT_SECRET, { expiresIn: "4h" } // Giảm thời gian token xuống 4 giờ
        );
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: "admin",
            role: "admin",
            loginTime: new Date().toISOString()
        }, JWT_SECRET, { expiresIn: '1d' } // Giảm thời gian refresh token xuống 1 ngày
        );
        // Set cookies với các options bảo mật cao hơn
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict", // Thay đổi từ 'none' sang 'strict' để tăng bảo mật
            maxAge: 4 * 60 * 60 * 1000, // 4 giờ
            path: "/",
            domain: process.env.COOKIE_DOMAIN || undefined
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 ngày
            path: "/",
            domain: process.env.COOKIE_DOMAIN || undefined
        });
        // Trả về thông tin admin
        res.status(200).json({
            success: true,
            message: "Đăng nhập admin thành công!",
            data: {
                id: "admin",
                username: ADMIN_USERNAME,
                role: "admin",
            }
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ!",
        });
    }
};
exports.adminLogin = adminLogin;
