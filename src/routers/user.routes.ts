import express from "express";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { getAllUser } from "../controllers/users.controller";

const router = express.Router();

router.get("/list-users", verifyAdmin, getAllUser);

export default router;
