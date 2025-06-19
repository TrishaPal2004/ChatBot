import { body, validationResult } from "express-validator";
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(422).json({ errors: errors.array() });
    };
};
export const loginValidator = [
    body("email").trim().notEmpty().isEmail().withMessage("Email is required"),
    body("password").isLength({ min: 4 }).withMessage("Password is required"),
];
export const signupValidator = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").trim().notEmpty().isEmail().withMessage("Email is required"),
    body("password").isLength({ min: 4 }).withMessage("Password is required"),
];
export const chatCompleteValidator = [
    body("message").notEmpty().withMessage("Message is required"),
];
//# sourceMappingURL=validators.js.map