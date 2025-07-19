"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("../controllers/users.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/user/list-users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get list of all users
 *     description: Retrieve a paginated list of all users with filtering and sorting options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for username, fullname, email, or bio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [online, offline, away]
 *         description: Filter by user status
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by gender
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: lastSeen
 *           enum: [lastSeen, username, fullname, email]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: desc
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           fullname:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           coverPhoto:
 *                             type: string
 *                           status:
 *                             type: string
 *                           lastSeen:
 *                             type: string
 *                             format: date-time
 *                           bio:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           dateOfBirth:
 *                             type: string
 *                             format: date
 *                           gender:
 *                             type: string
 *                           privacy:
 *                             type: object
 *                           settings:
 *                             type: object
 *                             properties:
 *                               theme:
 *                                 type: string
 *                               language:
 *                                 type: string
 *                               fontSize:
 *                                 type: number
 *                           socialLinks:
 *                             type: object
 *                           badges:
 *                             type: array
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: No users found
 *       500:
 *         description: Server error
 */
router.get("/list-users", users_controller_1.getAllUser);
exports.default = router;
