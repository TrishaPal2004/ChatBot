import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import chatroutes from "./routes/chat-routes.js";
import dotenv from "dotenv";
dotenv.config();
config();
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // if you're sending cookies
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
//console.log(process.env.COOKIE_SECRET)
//not req in production
app.use(morgan("dev"));
app.use("/api/v1", appRouter);
app.use('/api/v1/chat', chatroutes);
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Something went wrong" });
});
export default app;
//# sourceMappingURL=app.js.map