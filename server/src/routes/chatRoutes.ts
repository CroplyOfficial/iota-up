import {
  tryNewChat,
  newMessage,
  getChatById,
  toggleBlockChat,
} from "../controllers/chatControllers";
import { ensureAuthorized } from "../middleware/auth";
import express from "express";

const router = express.Router();

router.route("/").post(ensureAuthorized, tryNewChat);
router.route("/message").post(ensureAuthorized, newMessage);
router.route("/:id").get(ensureAuthorized, getChatById);
router.route("/toggle-block/:id").get(ensureAuthorized, toggleBlockChat);

export default router;
