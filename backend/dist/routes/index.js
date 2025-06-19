import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatroutes from "./chat-routes.js";
const appRouter = Router();
appRouter.use("/user", userRoutes);
appRouter.use("/chat", chatroutes);
export default appRouter;
//# sourceMappingURL=index.js.map