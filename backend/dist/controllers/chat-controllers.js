import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const sendChatToGemini = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chatSession = model.startChat({
            history: [],
        });
        const result = await chatSession.sendMessage(message);
        const text = result.response.text();
        return res.status(200).json({
            chats: [
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: text,
                    timestamp: new Date(),
                },
            ],
        });
    }
    catch (err) {
        console.error("🔥 Gemini API error:", err.message || err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=chat-controllers.js.map