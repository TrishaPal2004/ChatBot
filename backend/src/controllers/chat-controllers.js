import { Request, Response } from "express";
import fetch from "node-fetch";

export const sendChatToGemini = async (req, res,next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    console.log("Gemini key:", process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

