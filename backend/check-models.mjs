import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // ✅ CORRECT method for gemini-pro
    const chat = model.startChat({ history: [] });

    const result = await chat.sendMessage("Tell me a fun fact about space");
    const text = result.response.text();

    console.log("✅ Gemini replied:\n", text);
  } catch (err) {
    console.error("❌ Gemini-pro failed:", err.message || err);
  }
}

run();
