import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register } from "../controllers/authController.js";

const router = Router();

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Try again later.",
  },
});

router.post("/register", registrationLimiter, register);

export default router;