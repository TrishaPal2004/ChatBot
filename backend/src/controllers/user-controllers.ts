import User from "../models/User.js";
import {hash,compare} from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers= async(req,res,next)=>{
    try{
        const users=await User.find()
        return res.status(200).json({message:"Ok",users});
    }catch(error)
    {
        console.log(error);
        return res.status(200).json({message:"ERROR",cause:error.message});
    }
};

export const userSignup=async(req,res,next)=>{
    try{
        const{name,email,password}=req.body;
        const user1=await User.findOne({email});
        if(user1) return res.status(401).send("User already exists");
        const hashedPassword=await hash(password,10);
        const user=new User({name,email,password:hashedPassword});
        await user.save();
        //create token and store cookie
           res.clearCookie(COOKIE_NAME,{
                httpOnly:true,
               domain:"localhost",
               signed:true,
               path:"/",
            });
        const token=createToken(user._id.toString(),user.email,"7d");
        const expires=new Date();
        expires.setDate(expires.getDate()+7);
        res.cookie("auth_token",token,{path:"/",domain:"localhost",expires,httpOnly:true,signed:true});
        return res.status(201).json({message:"Ok",name:user.name,email:user.email});
    }catch(error)
    {
        console.log(error);
        return res.status(200).json({message:"ERROR",cause:error.message});
    }
};

export const userLogin=async(req,res,next)=>{
    console.log("🚀 Login request received:", req.body); // Debug log
    try{
        const {email,password}=req.body;
        console.log("📧 Looking for user with email:", email); // Debug log
        const user=await User.findOne({email});
        if(!user){
            console.log("❌ User not found"); // Debug log
            return res.status(401).send("User not registered");
        }
        console.log("✅ User found, checking password"); // Debug log
        const isPasswordCorrect=await compare(password,user.password);
        if(!isPasswordCorrect)
        {
            console.log("❌ Incorrect password"); // Debug log
            return res.status(403).send("Incorrect Password");
        }

        console.log("✅ Password correct, creating token"); // Debug log
        res.clearCookie(COOKIE_NAME,{
            httpOnly:true,
           domain:"localhost",
           signed:true,
           path:"/",
        });
        const token=createToken(user._id.toString(),user.email,"7d");
        const expires=new Date();
        expires.setDate(expires.getDate()+7);
        res.cookie("auth_token",token,{path:"/",domain:"localhost",expires,httpOnly:true,signed:true});
        console.log("✅ Login successful for:", user.email); // Debug log
        return res.status(201).json({message:"Ok",name:user.name,email:user.email});

    }catch(error)
    {
        console.log("💥 Login error:", error);
        return res.status(500).json({message:"ERROR",cause:error.message}); // Changed from 200 to 500
    }
};

export const verifyUser=async(req,res,next)=>{
    
    try{
        
        const user=await User.findById(res.locals.jwtData.id);
        if(!user){
            console.log("❌ User not found"); // Debug log
            return res.status(401).send("User not registered or Token malfunctioned");
        }
        if(user._id.toString()!==res.locals.jwtData.id){
            return res.status(401).send("Permission didn't match");
        }        
        
        res.clearCookie(COOKIE_NAME,{
            httpOnly:true,
           domain:"localhost",
           signed:true,
           path:"/",
        });
        const token=createToken(user._id.toString(),user.email,"7d");
        const expires=new Date();
        expires.setDate(expires.getDate()+7);
        res.cookie("auth_token",token,{path:"/",domain:"localhost",expires,httpOnly:true,signed:true});
        console.log("✅ Login successful for:", user.email); // Debug log
        return res.status(201).json({message:"Ok",name:user.name,email:user.email});

    }catch(error)
    {
        console.log("💥 Login error:", error);
        return res.status(500).json({message:"ERROR",cause:error.message}); // Changed from 200 to 500
    }
};