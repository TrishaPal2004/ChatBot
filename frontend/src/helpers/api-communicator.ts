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
export const sendChatRequest = async (message: string,conversationId?:string) => {
  try {
   const response = await fetch('http://localhost:5000/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message,
    conversationId,
  })
});

const data = await response.json();
console.log(data.data.message);

    return data; // { reply: '...' }
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
      console.error("API error response:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      // No response received
      console.error("No response:", error.request);
    } else {
      // Other error
      console.error("Error:", error.message);
    }
    throw new Error('Failed to get response from Gemini API');
  }
};

// helpers/api-communicator.ts
export const getChatHistory = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/v1/chat/history");
    if (!res.ok) throw new Error("Failed to fetch chat history");
    const data = await res.json();
    return data.data; // assuming backend returns { success: true, data: [...] }
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return [];
  }
};

export const getUserChats = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/v1/chat/all-chats", {
      method: 'GET', // Changed from POST to GET - more appropriate for fetching data
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Add credentials for authentication
    });

    if (!res.ok) {
      throw new Error(`Unable to fetch chats: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get user chats error:", error);
    throw error;
  }
};