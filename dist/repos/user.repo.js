"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/repos/user.repo.ts
const User_1 = __importDefault(require("@models/User"));
async function findByEmail(email) {
    return User_1.default.findOne({ email });
}
async function create(input) {
    const doc = await User_1.default.create(input);
    return doc;
}
const userRepo = { findByEmail, create };
exports.default = userRepo;
//# sourceMappingURL=user.repo.js.map