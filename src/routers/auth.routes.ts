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

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getMe", getMe);
router.get("/google/callback", googleAuthCallback);
router.put("/user/:id", verifyToken, updateProfile);

export default router;
