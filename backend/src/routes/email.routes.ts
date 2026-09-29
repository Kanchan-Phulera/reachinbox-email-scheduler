import { Router } from "express";
import {
  createEmail,
  getAllEmails,
  getScheduledEmails,
  getSentEmails,
} from "../controllers/email.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createEmail);
router.get("/", authenticateToken, getAllEmails);
router.get("/scheduled", authenticateToken, getScheduledEmails);
router.get("/sent", authenticateToken, getSentEmails);

export default router;