import User from "../models/User.js";
export const generateChatCompletion = async (req, res) => {
    const { message, aiResponse, conversationId, model } = req.body;
    console.log("📨 generateChatCompletion received:", { message, conversationId });
    try {
        const userId = res.locals.jwtData?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not registered" });
        }
        const finalConversationId = conversationId || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const finalAiResponse = aiResponse || "This is a placeholder AI response";
        user.chats.push({
            id: Date.now().toString(),
            content: message,
            role: "user",
            conversationId: finalConversationId
        }, {
            id: (Date.now() + 1).toString(),
            content: finalAiResponse,
            role: "assistant",
            conversationId: finalConversationId
        });
        await user.save();
        return res.status(200).json({
            success: true,
            data: {
                message: finalAiResponse,
                conversationId: finalConversationId,
                model: model || "unknown",
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("💥 Error in generateChatCompletion:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
export const sendChatsToUser = async (req, res, next) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered" });
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({ message: "Permissions didn't match" });
        }
        return res.status(200).json({
            message: "OK",
            data: user.chats // Changed from 'chats' to 'data' for consistency
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ERROR",
            cause: error.message
        });
    }
};
// NEW: Get chat history - returns unique conversation IDs
export const getChatHistory = async (req, res) => {
    try {
        const userId = res.locals.jwtData?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not registered"
            });
        }
        if (user._id.toString() !== userId) {
            return res.status(401).json({
                success: false,
                message: "Permissions didn't match"
            });
        }
        // Extract unique conversation IDs from chats
        const conversationIds = [...new Set(user.chats
                .filter(chat => chat.conversationId) // Only chats with conversationId
                .map(chat => chat.conversationId))];
        console.log("📋 Chat history found:", conversationIds.length, "conversations");
        return res.status(200).json({
            success: true,
            message: "Chat history retrieved successfully",
            data: conversationIds
        });
    }
    catch (error) {
        console.error("💥 Error in getChatHistory:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
// NEW: Get specific conversation by ID
export const getConversationByIdController = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = res.locals.jwtData?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID missing"
            });
        }
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not registered"
            });
        }
        if (user._id.toString() !== userId) {
            return res.status(401).json({
                success: false,
                message: "Permissions didn't match"
            });
        }
        // Filter chats by conversation ID and sort by timestamp
        const conversationMessages = user.chats
            .filter(chat => chat.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(chat => ({
            id: chat.id,
            role: chat.role,
            content: chat.content,
            timestamp: chat.timestamp
        }));
        if (conversationMessages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }
        console.log(`📨 Conversation ${conversationId} found with ${conversationMessages.length} messages`);
        return res.status(200).json({
            success: true,
            message: "Conversation retrieved successfully",
            data: {
                conversationId: conversationId,
                messages: conversationMessages
            }
        });
    }
    catch (error) {
        console.error("💥 Error in getConversationById:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
// Helper function to generate conversation ID
function generateConversationId() {
    return `conv_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}
// Optional: Add a migration endpoint to fix existing chats
export const migrateChatConversationIds = async (req, res) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered" });
        }
        // Update chats that don't have conversationId
        let updated = false;
        user.chats.forEach(chat => {
            if (!chat.conversationId) {
                chat.conversationId = generateConversationId();
                updated = true;
            }
        });
        if (updated) {
            await user.save();
        }
        return res.status(200).json({
            success: true,
            message: "Chat migration completed",
            data: {
                updated,
                totalChats: user.chats.length
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ERROR",
            cause: error.message
        });
    }
};
//# sourceMappingURL=chat-controllers.js.map