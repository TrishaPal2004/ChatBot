import { Request, Response } from "express";
import fetch from "node-fetch";

export const sendChatToGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a string" });
    }

    const API_KEY = "AIzaSyBu1CX69rixHZJ76IcLp7bo2Y_cEXACVlM"; // 🔐 direct use (safe for local dev only)

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("🟢 Gemini API response:", data);

    if (data.error) {
      console.error("❌ Gemini API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
