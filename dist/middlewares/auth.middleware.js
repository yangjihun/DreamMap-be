"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@config/config"));
const User_1 = __importDefault(require("@models/User"));
const authenticate = (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) {
            return res.status(401).json({ status: "fail", message: "토큰 없음" });
        }
        const token = tokenString.replace("Bearer ", "");
        const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        req.userId = payload._id;
        return next();
    }
    catch (err) {
        return next(err);
    }
};
exports.authenticate = authenticate;
const checkAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ status: "fail", message: "인증 필요" });
        }
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            return res.status(403).json({ status: "fail", message: "권한 부족" });
        }
        return next();
    }
    catch (err) {
        return next(err);
    }
};
exports.checkAdmin = checkAdmin;
//# sourceMappingURL=auth.middleware.js.map