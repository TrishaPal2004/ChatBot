import User from "../models/User.js";

export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered" });
        }
        
        // Get existing chats and format them for AI API
        const chats = user.chats.map(({ role, content }) => ({
            role,
            content,
        }));
        
        // Add the new user message
        chats.push({ content: message, role: "user" });
        
       
        const aiMessage = "This is a placeholder AI response";
        
        // Add messages to user's chats array (push to DocumentArray)
        user.chats.push({ 
            id: new Date().getTime().toString(), 
            content: message, 
            role: "user" 
        });
        
        user.chats.push({ 
            id: (new Date().getTime() + 1).toString(), 
            content: aiMessage, 
            role: "assistant" 
        });
        
        // Save the updated user
        await user.save();
        
        return res.status(200).json({ 
            message: "Chat completion generated successfully", 
            chats: user.chats 
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: "ERROR", 
            cause: error.message 
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
            chats: user.chats 
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: "ERROR", 
            cause: error.message 
        });
    }
};