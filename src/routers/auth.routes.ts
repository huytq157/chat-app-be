import express from "express";
import {
  getMe,
  googleAuth,
  googleAuthCallback,
  login,
  logout,
  register,
  updateProfile,
  loginLimiter,
  adminLogin,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with username, email, fullname and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - fullname
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username (3-20 characters, alphanumeric and underscore only)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               fullname:
 *                 type: string
 *                 description: User's full name
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 8 chars, must include uppercase, lowercase, number and special char)
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     status:
 *                       type: string
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginLimiter, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logout the currently authenticated user
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                     logoutTime:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/getMe:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     status:
 *                       type: string
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *                     bio:
 *                       type: string
 *                     privacy:
 *                       type: object
 *                     settings:
 *                       type: object
 *       401:
 *         description: Not authenticated
 */
router.get("/getMe", getMe);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth authentication callback
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication token
 */
router.get("/google/callback", googleAuthCallback);

/**
 * @swagger
 * /api/auth/user/{id}:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Update user profile
 *     description: Update the profile of a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               coverPhoto:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               privacy:
 *                 type: object
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.put("/user/:id", verifyToken, updateProfile);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth login
 *     description: Redirect to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get("/google", googleAuth);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin login
 *     description: Authenticate admin user with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
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
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/admin/login", adminLogin);

export default router;
