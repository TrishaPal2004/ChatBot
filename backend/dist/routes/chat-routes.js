import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from '../utils/token-manager.js';
import { sendChatsToUser } from '../controllers/chat-controllers.js';
const chatroutes = Router();
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Available models (try in order of preference)
const AVAILABLE_MODELS = [
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-pro',
    'gemini-2.5-pro'
];
let currentModel = null;
let currentModelName = null;
// Store chat sessions in memory (use database/Redis in production)
const chatSessions = new Map();
// Initialize model on startup
async function initializeModel() {
    console.log('🔄 Initializing Gemini model...');
    for (const modelName of AVAILABLE_MODELS) {
        try {
            const testModel = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            });
            // Test the model with a simple prompt
            const result = await testModel.generateContent("Hello");
            const response = await result.response;
            await response.text(); // Ensure we can get the text
            currentModel = testModel;
            currentModelName = modelName;
            console.log(`✅ Successfully initialized with model: ${modelName}`);
            return true;
        }
        catch (error) {
            console.log(`❌ Model ${modelName} failed: ${error.message}`);
        }
    }
    console.error('❌ No models available. Please check your API key and quota.');
    return false;
}
// Initialize model when routes are loaded
initializeModel();
// Middleware to check if model is available
const checkModelAvailability = (req, res, next) => {
    if (!currentModel) {
        return res.status(503).json({
            success: false,
            error: 'Service Unavailable',
            message: 'AI model is not available. Please try again later.'
        });
    }
    next();
};
// POST /api/v1/chat - Send message to chatbot
chatroutes.post('/', checkModelAvailability, async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Message is required and must be a non-empty string'
            });
        }
        // Sanitize message
        const sanitizedMessage = message.trim();
        console.log('📨 Processing message:', sanitizedMessage);
        let chat;
        const sessionId = conversationId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Check if we have an existing chat session
        if (conversationId && chatSessions.has(conversationId)) {
            chat = chatSessions.get(conversationId);
            console.log('🔄 Using existing chat session:', conversationId);
        }
        else {
            // Create new chat session
            chat = currentModel.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                },
            });
            chatSessions.set(sessionId, chat);
            console.log('✨ Created new chat session:', sessionId);
        }
        // Send message to Gemini
        const result = await chat.sendMessage(sanitizedMessage);
        const response = await result.response;
        const botMessage = response.text();
        // Clean up old sessions (keep only last 20)
        if (chatSessions.size > 20) {
            const oldestKeys = Array.from(chatSessions.keys()).slice(0, chatSessions.size - 20);
            oldestKeys.forEach(key => chatSessions.delete(key));
            console.log(`🧹 Cleaned up ${oldestKeys.length} old chat sessions`);
        }
        // Log successful response
        console.log('✅ Generated response length:', botMessage);
        return res.status(200).json({
            success: true,
            data: {
                message: botMessage,
                conversationId: sessionId,
                model: currentModelName,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('💥 Chat API Error:', error);
        // Handle specific Gemini API errors
        if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
            return res.status(429).json({
                success: false,
                error: 'Rate Limit Exceeded',
                message: 'Too many requests. Please wait a moment and try again.',
                retryAfter: 60 // seconds
            });
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
            return res.status(429).json({
                success: false,
                error: 'Quota Exceeded',
                message: 'API quota exceeded. Please check your billing settings.'
            });
        }
        if (error.message.includes('API_KEY_INVALID')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API Key',
                message: 'Please check your Gemini API key configuration.'
            });
        }
        if (error.message.includes('SAFETY') || error.message.includes('BLOCKED')) {
            return res.status(400).json({
                success: false,
                error: 'Content Policy Violation',
                message: 'Your message was blocked by safety filters. Please try rephrasing.'
            });
        }
        // Try to reinitialize model if it fails
        if (error.message.includes('not found') || error.message.includes('not supported')) {
            console.log('🔄 Model failed, attempting to reinitialize...');
            const modelInitialized = await initializeModel();
            if (modelInitialized) {
                return res.status(200).json({
                    success: false,
                    error: 'Model Switched',
                    message: 'The AI model was switched due to an error. Please try your request again.',
                    requiresRetry: true,
                    newModel: currentModelName
                });
            }
        }
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// GET /api/v1/chat/models - Get available models info
chatroutes.get('/models', async (req, res) => {
    try {
        const modelStatus = [];
        for (const modelName of AVAILABLE_MODELS) {
            try {
                const testModel = genAI.getGenerativeModel({ model: modelName });
                const result = await testModel.generateContent("test");
                await result.response.text();
                modelStatus.push({
                    model: modelName,
                    status: 'available',
                    current: modelName === currentModelName
                });
            }
            catch (error) {
                modelStatus.push({
                    model: modelName,
                    status: 'unavailable',
                    error: error.message,
                    current: false
                });
            }
        }
        res.status(200).json({
            success: true,
            data: {
                currentModel: currentModelName,
                availableModels: modelStatus,
                totalSessions: chatSessions.size
            }
        });
    }
    catch (error) {
        console.error('Models check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Could not check model availability'
        });
    }
});
// GET /api/v1/chat/:conversationId
chatroutes.get('/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const chat = chatSessions.get(conversationId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    // You need to store messages somewhere for this to work
    res.json({ success: true, data: chat.history || [] });
});
// DIDNT WORK GET /api/v1/chat/history - List all conversations (just conversationId + timestamps)
chatroutes.get('/history', (req, res) => {
    const history = Array.from(chatSessions.entries()).map(([id, chat]) => ({
        conversationId: id,
        lastUpdated: new Date(), // or use your own tracking
    }));
    res.json({ success: true, data: history });
});
// DELETE /api/v1/chat - Clear all chat sessions
chatroutes.delete('/', (req, res) => {
    try {
        const sessionCount = chatSessions.size;
        chatSessions.clear();
        console.log(`🧹 Cleared all ${sessionCount} chat sessions`);
        res.status(200).json({
            success: true,
            message: `Cleared ${sessionCount} chat sessions successfully`
        });
    }
    catch (error) {
        console.error('Clear all sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to clear chat sessions'
        });
    }
});
// GET /api/v1/chat/health - Chat service health check
chatroutes.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'OK',
            modelAvailable: currentModel !== null,
            currentModel: currentModelName,
            activeSessions: chatSessions.size,
            timestamp: new Date().toISOString()
        }
    });
});
chatroutes.get("/all-chats", 
// validate(chatCompleteValidator),
verifyToken, sendChatsToUser);
export default chatroutes;
//# sourceMappingURL=chat-routes.js.map