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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallback = exports.googleAuth = exports.getAllUser = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const users_models_1 = require("../models/users.models");
const argon2 = __importStar(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
const JWT_SECRET = process.env.PASSJWT;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, fullname, password, avatar } = req.body;
        if (!email || !password || !fullname || !avatar) {
            res.status(400).json({
                success: false,
                message: "Missing parameters!",
            });
            return;
        }
        const userExist = yield users_models_1.UserModel.findOne({ email });
        if (userExist) {
            res.status(400).json({
                success: false,
                message: "Email đã tồn tại",
            });
            return;
        }
        const hashPassword = yield argon2.hash(password);
        const newUser = new users_models_1.UserModel({
            fullname,
            email,
            password: hashPassword,
            avatar,
        });
        yield newUser.save();
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: newUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Missing parameters!",
            });
            return;
        }
        const findUser = yield users_models_1.UserModel.findOne({ email });
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
        const checkPass = yield argon2.verify(findUser.password, password);
        if (!checkPass) {
            res.status(400).json({
                success: false,
                message: "Mật khẩu không đúng!",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: findUser._id,
        }, JWT_SECRET, { expiresIn: "12h" });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
});
exports.login = login;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        // Tìm người dùng trong cơ sở dữ liệu
        const user = yield users_models_1.UserModel.findById(userId);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
});
exports.getMe = getMe;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const _a = req.body, { email } = _a, updateData = __rest(_a, ["email"]);
        const updatedUser = yield users_models_1.UserModel.findByIdAndUpdate(userId, updateData, {
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
});
exports.updateProfile = updateProfile;
const getAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, q = "" } = req.query;
        // Chuyển đổi `page` và `limit` thành số nguyên
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
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
        const totalUsers = yield users_models_1.UserModel.countDocuments(searchQuery);
        // Lấy dữ liệu người dùng với phân trang
        const users = yield users_models_1.UserModel.find(searchQuery, "-password")
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
    }
    catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ!",
        });
    }
});
exports.getAllUser = getAllUser;
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
