"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_repo_1 = __importDefault(require("@repos/user.repo"));
const SALT_ROUNDS = 10;
async function createUser(params) {
    var _a, _b;
    const { email, name, password } = params;
    if (!password) {
        const err = new Error("비밀번호를 입력해주세요");
        err.status = 400;
        throw err;
    }
    const exists = await user_repo_1.default.findByEmail(email);
    if (exists) {
        const err = new Error("이미 가입된 유저입니다");
        err.status = 409;
        throw err;
    }
    const hash = bcryptjs_1.default.hashSync(password, bcryptjs_1.default.genSaltSync(SALT_ROUNDS));
    const newUser = await user_repo_1.default.create({
        ...params,
        password: hash,
        level: (_a = params.level) !== null && _a !== void 0 ? _a : "customer",
        loginType: (_b = params.loginType) !== null && _b !== void 0 ? _b : "local",
    });
    return { id: String(newUser._id), email: newUser.email, name: newUser.name };
}
const userService = {
    createUser,
};
exports.default = userService;
//# sourceMappingURL=user.service.js.map