import express from "express";
import { sendChatToGemini } from "../controllers/chat-controllers.js";

const chatRoutes = express.Router();

// Match: /api/v1/chat/new
chatRoutes.post("/new", sendChatToGemini);

export default chatRoutes;
