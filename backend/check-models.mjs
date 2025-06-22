
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with your API key
const genAI = new GoogleGenerativeAI("AIzaSyBu1CX69rixHZJ76IcLp7bo2Y_cEXACVlM");

// Available models as of June 2025:
// - gemini-1.5-flash (if you have prior usage)
// - gemini-1.5-pro (if you have prior usage)
// - gemini-2.5-flash (current recommended)
// - gemini-2.5-pro (current recommended)
// - gemini-2.5-flash-lite (most cost-efficient)

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", // Try this first
  // Alternative models to try:
  // model: "gemini-2.5-flash",
  // model: "gemini-2.5-pro", 
  // model: "gemini-2.5-flash-lite"
});

async function run() {
  try {
    console.log("🚀 Testing Gemini API...");
    
    const result = await model.generateContent("Hello, Gemini! Please introduce yourself.");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Gemini says:", text);
    
  } catch (err) {
    console.error("❌ Error during generateContent:", err);
    console.error("Error details:", err.message);
    
    // Try alternative models if the first one fails
    await tryAlternativeModels();
  }
}

async function tryAlternativeModels() {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite", 
    "gemini-1.5-pro",
    "gemini-2.5-pro"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      
      const testModel = genAI.getGenerativeModel({ model: modelName });
      const result = await testModel.generateContent("Hello, Gemini!");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Success with ${modelName}:`, text);
      return; // Exit on first successful model
      
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
    }
  }
  
  console.log("❌ All models failed. Please check your API key and quota.");
}

// Function to list available models (if you want to check what's available)
async function listAvailableModels() {
  try {
    console.log("📋 Checking available models...");
    
    // Note: This might not work with all API keys, depending on permissions
    const models = await genAI.listModels();
    console.log("Available models:", models);
    
  } catch (error) {
    console.log("❌ Could not list models:", error.message);
  }
}

// Enhanced function with configuration options
async function runWithConfig() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    const prompt = "Write a short poem about AI helping humans.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Creative response:", text);
    
  } catch (error) {
    console.error("❌ Error with configuration:", error);
  }
}

// Function for chat conversation
async function startChat() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello, I want to learn about programming." }],
        },
        {
          role: "model",
          parts: [{ text: "Great! I'd be happy to help you learn programming. What specific language or concept would you like to start with?" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    
    const msg = "Tell me about JavaScript basics.";
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    
    console.log("💬 Chat response:", text);
    
  } catch (error) {
    console.error("❌ Chat error:", error);
  }
}

// Run the tests
async function main() {
  console.log("🎯 Testing Gemini API with current models...\n");
  
  await run();
  console.log("\n" + "=".repeat(50) + "\n");
  
  await runWithConfig();
  console.log("\n" + "=".repeat(50) + "\n");
  
  await startChat();
  console.log("\n" + "=".repeat(50) + "\n");
  
  await listAvailableModels();
}

// Execute the main function
main().catch(console.error);
run();


