import {createContext, type ReactNode,useState,useEffect, useContext} from "react";
import { checkAuthStatus, loginUser } from "../helpers/api-communicator";
type User={
    name:string;
    email:string
};

type UserAuth={
    isLoggedIn:boolean;
    user:User |null;
    login:(email:string,password:string)=>Promise<void>;
    signup:(name:string,email:string,password:string)=>Promise<void>;
    logout:()=>Promise<void>;
}

const AuthContext = createContext<UserAuth|null>(null);

export const AuthProvider=({children}:{children:ReactNode})=>{
    const [user,setUser]=useState<User|null>(null);
    const[isLoggedIn,setIsLoggedIn]=useState(false);
    
useEffect(() => {
  const checkStatus = async () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser: User = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    } 
  };
  checkStatus(); // ✅ Now valid
}, []);



   


    const login = async (email: string, password: string) => {
        try {
            const data = await loginUser(email, password);
            if (data) {
                const userData = { email: data.email, name: data.name };
                setUser(userData);
                setIsLoggedIn(true);
                // Save to localStorage
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                console.error("Login failed: No user data returned");
                throw new Error("No user data returned");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error; // Re-throw to let the component handle it
        }
    };

    const signup=async(name:string,email:string,password:string)=>{
        // Implement signup logic
    };
    
    const logout = async () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("user");
    };

    const value={
        user,isLoggedIn,login,logout,signup
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth=()=>{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};