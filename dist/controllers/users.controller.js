"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUser = void 0;
const users_models_1 = require("../models/users.models");
const getAllUser = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, q = "", status, gender, sortBy = "lastSeen", sortOrder = "desc", } = req.query;
        // Chuyển đổi các tham số
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Xây dựng điều kiện tìm kiếm
        const searchQuery = {
            isDeleted: false,
        };
        // Tìm kiếm theo từ khóa
        if (q) {
            searchQuery.$or = [
                { username: { $regex: q, $options: "i" } },
                { fullname: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { bio: { $regex: q, $options: "i" } },
            ];
        }
        // Lọc theo trạng thái
        if (status) {
            searchQuery.status = status;
        }
        // Lọc theo giới tính
        if (gender) {
            searchQuery.gender = gender;
        }
        // Xây dựng options cho sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
        // Tính tổng số người dùng
        const totalUsers = await users_models_1.UserModel.countDocuments(searchQuery);
        // Lấy danh sách người dùng
        const users = await users_models_1.UserModel.find(searchQuery)
            .select("-password -security -verification")
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);
        if (!users || users.length === 0) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng nào!",
            });
            return;
        }
        // Format dữ liệu trả về
        const formattedUsers = users.map((user) => ({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            avatar: user.avatar,
            coverPhoto: user.coverPhoto,
            status: user.status,
            lastSeen: user.lastSeen,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            privacy: user.privacy,
            settings: {
                theme: user.settings.theme,
                language: user.settings.language,
                fontSize: user.settings.fontSize,
            },
            socialLinks: user.socialLinks,
            badges: user.badges,
        }));
        res.status(200).json({
            success: true,
            message: "Lấy danh sách người dùng thành công!",
            data: {
                users: formattedUsers,
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(totalUsers / limitNumber),
                },
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
};
exports.getAllUser = getAllUser;
