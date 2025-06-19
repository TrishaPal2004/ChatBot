import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { COOKIE_NAME } from "./constants.js";
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    console.log(expiresIn);
    console.log("hi");
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    return token;
};
export const verifyToken = async (req, res, next) => {
    const token = req.signedCookies[`${COOKIE_NAME}`];
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token not received" });
    }
    console.log(token);
    return new Promise((resolve, reject) => {
        return jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
            if (err) {
                reject(err.message);
                return res.status(401).json({ message: "Tokenn expired" });
            }
            else {
                resolve();
                res.locals.jwtData = success;
                return next();
            }
        });
    });
};
//# sourceMappingURL=token-manager.js.map