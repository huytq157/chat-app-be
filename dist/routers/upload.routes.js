"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_controller_1 = require("../controllers/upload.controller");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
router.post("/file", upload.array("files"), upload_controller_1.uploadFiles);
router.get("/file/:fileId", upload_controller_1.getFile);
/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: Upload multiple files to Google Drive
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The files to upload.
 *     responses:
 *       200:
 *         description: Successfully uploaded files.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileId:
 *                         type: string
 *                         example: "1A2B3C4D5E"
 *                       fileName:
 *                         type: string
 *                         example: "example.jpg"
 *                       webViewLink:
 *                         type: string
 *                         example: "https://drive.google.com/file/d/1A2B3C4D5E/view"
 *                       webContentLink:
 *                         type: string
 *                         example: "https://drive.google.com/uc?id=1A2B3C4D5E"
 *       400:
 *         description: No files uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No files uploaded."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "File upload failed."
 *                 error:
 *                   type: string
 *                   example: "An error occurred while uploading the files."
 */
/**
 * @swagger
 * /api/upload/file/{fileId}:
 *   get:
 *     summary: Get file information from Google Drive
 *     tags:
 *       - Upload
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved file information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                       example: "1A2B3C4D5E"
 *                     fileName:
 *                       type: string
 *                       example: "example.jpg"
 *                     mimeType:
 *                       type: string
 *                       example: "image/jpeg"
 *                     webViewLink:
 *                       type: string
 *                       example: "https://drive.google.com/file/d/1A2B3C4D5E/view"
 *                     webContentLink:
 *                       type: string
 *                       example: "https://drive.google.com/uc?id=1A2B3C4D5E"
 *       400:
 *         description: File ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "File ID is required."
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "File not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get file."
 *                 error:
 *                   type: string
 *                   example: "An error occurred while retrieving the file."
 */
exports.default = router;
