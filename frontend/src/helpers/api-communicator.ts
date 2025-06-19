import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:5000/api/v1/user/login", { // Correct route based on your backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

export const checkAuthStatus = async () => {
  
    const response = await axios.get("http://localhost:5000/api/v1/user/auth-status"); // Correct route based on your backend
      if(response.status!==200){
      throw new Error("Unable to authenticate");
      }
      const data=await response.data;
      return data;
};

export const sendChatRequest = async (message:string) => {
  
    const response = await axios.post("http://localhost:5000/api/chat/new",{message}); // Correct route based on your backend
      if(response.status!==200){
      throw new Error("Unable to send chat");
      }
      const data=await response.data;
      return data;
};