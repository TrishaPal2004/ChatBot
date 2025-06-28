import axios from "axios";

// Login user with email & password
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:5000/api/v1/user/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include", // If you are using cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Login API error:', error);
    throw new Error('Unable to login');
  }
};

// Check if user is authenticated
export const checkAuthStatus = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/v1/user/auth-status", {
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error("Unable to authenticate");
    }

    return response.data;
  } catch (error) {
    console.error('Auth check error:', error);
    throw new Error('Authentication failed');
  }
};

// Send a chat message to Gemini backend
export const sendChatRequest = async (message: string, conversationId?: string) => {
  try {
    console.log('📤 Sending chat request:', { message: message.substring(0, 50) + '...', conversationId });
    
    const response = await fetch('http://localhost:5000/api/v1/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Add credentials for authentication
      body: JSON.stringify({ 
        message,
        conversationId,
      })
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, response.statusText);
      console.error('❌ Error body:', errorText);
      
      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('📥 Full response data:', data);

    // Validate response structure
    if (!data) {
      throw new Error('Empty response from server');
    }

    if (!data.success && data.success !== undefined) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    // Handle different possible response structures
    let responseMessage = '';
    let conversationIdFromResponse = conversationId;

    // Check various possible response structures
    if (data.data?.message) {
      responseMessage = data.data.message;
      conversationIdFromResponse = data.data.conversationId || conversationId;
    } else if (data.message) {
      responseMessage = data.message;
      conversationIdFromResponse = data.conversationId || conversationId;
    } else if (data.data?.reply) {
      responseMessage = data.data.reply;
      conversationIdFromResponse = data.data.conversationId || conversationId;
    } else if (data.reply) {
      responseMessage = data.reply;
      conversationIdFromResponse = data.conversationId || conversationId;
    } else if (data.data?.aiResponse) {
      responseMessage = data.data.aiResponse;
      conversationIdFromResponse = data.data.conversationId || conversationId;
    } else if (data.aiResponse) {
      responseMessage = data.aiResponse;
      conversationIdFromResponse = data.conversationId || conversationId;
    } else {
      console.error('❌ Unexpected response structure:', data);
      throw new Error('Invalid response format from server');
    }

    if (!responseMessage) {
      throw new Error('No message content in response');
    }

    console.log('✅ Parsed response message length:', responseMessage.length);
    console.log('✅ Conversation ID:', conversationIdFromResponse);

    return {
      success: true,
      message: responseMessage,
      reply: responseMessage, // For backward compatibility
      conversationId: conversationIdFromResponse,
      model: data.model || data.data?.model,
      ...data // Include any other fields from the response
    };

  } catch (error: any) {
    console.error('💥 Chat request error:', error);
    
    // Enhanced error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to get response from Gemini API');
  }
};

// helpers/api-communicator.ts
export const getChatHistory = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/v1/chat/history", {
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("❌ Failed to load chat history:", data?.message || "Unknown error");
      return [];
    }

    // ✅ Ensure chatHistory is an array of string IDs
    return Array.isArray(data.data)
      ? data.data.map((item: { conversationId?: any; id?: any }) =>
          typeof item === "string"
            ? item
            : item?.conversationId || item?.id || String(item)
        )
      : [];
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return [];
  }
};


export const getConversationById = async (conversationId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/chat/${conversationId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Get conversation error response:', errorText);
      throw new Error(`Unable to fetch chat: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data; 
  } catch (error) {
    console.error("Get conversation error:", error);
    throw error;
  }
};


// Additional helper function to test the chat endpoint
export const testChatEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/chat/health', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🏥 Chat service health:', data);
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export const signupuser = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }), 
    });

    if (!response.ok) {
      throw new Error(`Signup failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Signup response:', data);
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
};
