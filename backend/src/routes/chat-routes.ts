import express from "express";
import { sendChatToGemini } from "../controllers/chat-controllers.js";

const chatRoutes = express.Router();
chatRoutes.post("/new", (req, res, next) => {
  console.log("Route handler reached");
  next();
}, sendChatToGemini);

export default chatRoutes;