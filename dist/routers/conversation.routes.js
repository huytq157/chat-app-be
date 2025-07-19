"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middleware/verifyToken");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = express_1.default.Router();
const conversationController = new conversation_controller_1.ConversationController();
/**
 * @swagger
 * /api/conversation:
 *   post:
 *     tags:
 *       - Conversations
 *     summary: Create a new conversation
 *     description: Create a new conversation (direct, group, channel, or broadcast)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - participants
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [direct, group, channel, broadcast]
 *                 description: Type of conversation
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the conversation
 *               name:
 *                 type: string
 *                 description: Name of the conversation (required for group/channel/broadcast)
 *               description:
 *                 type: string
 *                 description: Description of the conversation
 *               avatar:
 *                 type: string
 *                 description: URL of the conversation avatar
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           status:
 *                             type: string
 *                       role:
 *                         type: string
 *                         enum: [owner, admin, moderator, member]
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                 settings:
 *                   type: object
 *                   properties:
 *                     allowInvites:
 *                       type: boolean
 *                     onlyAdminsCanPost:
 *                       type: boolean
 *                     slowMode:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                         interval:
 *                           type: number
 *                     messageRetention:
 *                       type: number
 *                     joinMode:
 *                       type: string
 *                       enum: [open, approval, invite]
 *                     messageApproval:
 *                       type: boolean
 *                     antiSpam:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                         maxMessagesPerMinute:
 *                           type: number
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken_1.verifyToken, conversationController.createConversation);
/**
 * @swagger
 * /api/conversation:
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Get list of conversations
 *     description: Retrieve a paginated list of conversations for the current user
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
 *           default: 20
 *         description: Number of conversations per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group, channel, broadcast]
 *         description: Filter conversations by type
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [direct, group, channel, broadcast]
 *                         description: Type of conversation
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 username:
 *                                   type: string
 *                                 avatar:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                             role:
 *                               type: string
 *                               enum: [member, admin, moderator, owner]
 *                             joinedAt:
 *                               type: string
 *                               format: date-time
 *                       lastMessage:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           sender:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               username:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                 total:
 *                   type: integer
 *                   description: Total number of conversations matching the filter
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken_1.verifyToken, conversationController.getConversations);
/**
 * @swagger
 * /api/conversation/{conversationId}:
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Get conversation details
 *     description: Retrieve detailed information about a specific conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Conversation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           status:
 *                             type: string
 *                       role:
 *                         type: string
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                 lastMessage:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     sender:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 settings:
 *                   type: object
 *                   properties:
 *                     allowInvites:
 *                       type: boolean
 *                     onlyAdminsCanPost:
 *                       type: boolean
 *                     slowMode:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                         interval:
 *                           type: number
 *                     messageRetention:
 *                       type: number
 *                     joinMode:
 *                       type: string
 *                       enum: [open, approval, invite]
 *                     messageApproval:
 *                       type: boolean
 *                     antiSpam:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                         maxMessagesPerMinute:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get("/:conversationId", verifyToken_1.verifyToken, conversationController.getConversation);
/**
 * @swagger
 * /api/conversation/{conversationId}:
 *   put:
 *     tags:
 *       - Conversations
 *     summary: Update conversation
 *     description: Update conversation details (only admin/moderator/owner can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the conversation
 *               description:
 *                 type: string
 *                 description: New description for the conversation
 *               avatar:
 *                 type: string
 *                 description: New avatar URL for the conversation
 *               settings:
 *                 type: object
 *                 properties:
 *                   allowInvites:
 *                     type: boolean
 *                   onlyAdminsCanPost:
 *                     type: boolean
 *                   slowMode:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       interval:
 *                         type: number
 *                   messageRetention:
 *                     type: number
 *                   joinMode:
 *                     type: string
 *                     enum: [open, approval, invite]
 *                   messageApproval:
 *                     type: boolean
 *                   antiSpam:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       maxMessagesPerMinute:
 *                         type: number
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 settings:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.put("/:conversationId", verifyToken_1.verifyToken, conversationController.updateConversation);
/**
 * @swagger
 * /api/conversation/{conversationId}:
 *   delete:
 *     tags:
 *       - Conversations
 *     summary: Delete conversation
 *     description: Soft delete a conversation (only admin/owner can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Conversation deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.delete("/:conversationId", verifyToken_1.verifyToken, conversationController.deleteConversation);
exports.default = router;
