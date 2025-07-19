"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middleware/verifyToken");
const message_controller_1 = require("../controllers/message.controller");
const router = express_1.default.Router();
const messageController = new message_controller_1.MessageController();
/**
 * @swagger
 * /api/messages/conversation/{conversationId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get messages from a conversation
 *     description: Retrieve a paginated list of messages from a specific conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
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
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: List of messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       conversation:
 *                         type: string
 *                       sender:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       type:
 *                         type: string
 *                         enum: [text, image, file]
 *                       content:
 *                         type: string
 *                       readBy:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: string
 *                             readAt:
 *                               type: string
 *                               format: date-time
 *                       reactions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: string
 *                             emoji:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                       isEdited:
 *                         type: boolean
 *                       isDeleted:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get("/conversation/:conversationId", verifyToken_1.verifyToken, messageController.getMessages);
/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a new message
 *     description: Create and send a new message in a conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               content:
 *                 type: string
 *                 description: Message content
 *               type:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *                 description: Type of message
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 conversation:
 *                   type: string
 *                 sender:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                 type:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken_1.verifyToken, messageController.sendMessage);
/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Mark message as read
 *     description: Mark a specific message as read by the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put("/:messageId/read", verifyToken_1.verifyToken, messageController.markAsRead);
/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Delete a message
 *     description: Soft delete a message (only the sender can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete("/:messageId", verifyToken_1.verifyToken, messageController.deleteMessage);
/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Edit a message
 *     description: Edit the content of a message (only the sender can edit)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 content:
 *                   type: string
 *                 isEdited:
 *                   type: boolean
 *                 editHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       editedAt:
 *                         type: string
 *                         format: date-time
 *                       editedBy:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to edit this message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put("/:messageId", verifyToken_1.verifyToken, messageController.editMessage);
/**
 * @swagger
 * /api/messages/{messageId}/reactions:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Add reaction to message
 *     description: Add or update a reaction to a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: Emoji reaction
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       emoji:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.post("/:messageId/reactions", verifyToken_1.verifyToken, messageController.addReaction);
/**
 * @swagger
 * /api/messages/{messageId}/reactions/{reactionId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Remove reaction from message
 *     description: Remove a reaction from a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message
 *       - in: path
 *         name: reactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the reaction
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       emoji:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message or reaction not found
 *       500:
 *         description: Server error
 */
router.delete("/:messageId/reactions/:reactionId", verifyToken_1.verifyToken, messageController.removeReaction);
exports.default = router;
