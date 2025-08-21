"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("@services/user.service"));
const userController = {
    createUser: async (req, res, next) => {
        try {
            const { email, name, password, region, interestJob, level, school, major, career, skill, loginType } = req.body;
            const data = await user_service_1.default.createUser({
                email,
                name,
                password,
                region,
                interestJob,
                level,
                school,
                major,
                career,
                skill,
                loginType
            });
            return res.status(201).json({ status: "success", user: data });
        }
        catch (error) {
            // Mongoose ValidationError 포맷 처리
            if ((error === null || error === void 0 ? void 0 : error.name) === "ValidationError") {
                const messages = Object.values(error.errors).map((e) => e.message);
                error = new Error(messages.join("\n"));
                error.status = 400;
            }
            return next(error);
        }
    },
};
exports.default = userController;
//# sourceMappingURL=user.controller.js.map