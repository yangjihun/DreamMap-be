"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@config/config"));
const { jwt: jwtCfg } = config_1.default;
/** 스키마 */
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    school: { type: String, default: null },
    major: { type: String, default: null },
    career: { type: String, default: null },
    skill: { type: String, default: null },
    region: { type: String, required: true },
    interestJob: { type: String, required: true },
    level: { type: String, enum: ["customer", "pro"], default: "customer" },
    loginType: { type: String, enum: ["local", "google", "github"], default: "local" },
}, { timestamps: true });
/** 인스턴스 메서드 */
userSchema.methods.generateToken = function () {
    if (!jwtCfg.secret) {
        throw new Error("JWT secret not configured");
    }
    return jsonwebtoken_1.default.sign({ id: this._id.toString() }, jwtCfg.secret, {
        expiresIn: jwtCfg.expiresIn,
    });
};
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map