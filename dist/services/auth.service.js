"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const config_1 = __importDefault(require("@config/config"));
const User_1 = __importDefault(require("@models/User"));
// 필요 시 활성화 (현재 이 파일에서는 사용 안 함)
const googleClient = new google_auth_library_1.OAuth2Client(config_1.default.google.clientId);
// 필요 시 주석 해제하여 사용
// type LoginWithGoogleParams = { idToken: string };
// export async function loginWithGoogle({ idToken }: LoginWithGoogleParams): Promise<LoginResult> {
//   const ticket = await googleClient.verifyIdToken({
//     idToken,
//     audience: google.clientId,
//   });
//   const { email, name } = ticket.getPayload() as { email: string; name: string };
//   let user = await User.findOne({ email });
//   if (!user) {
//     const salt = await bcrypt.genSalt(10);
//     const newPassword = await bcrypt.hash(String(Math.floor(Math.random() * 1e8)), salt);
//     user = await new User({ name, email, password: newPassword }).save();
//   }
//   const token: string = await user.generateToken();
//   return { user, token };
// }
async function loginWithEmail({ email, password, }) {
    const user = await User_1.default.findOne({ email }).select("-createdAt -updatedAt -__v");
    if (!user) {
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
    }
    const ok = bcryptjs_1.default.compareSync(password, user.password);
    if (!ok) {
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
    }
    const token = await user.generateToken();
    return { user, token };
}
async function getUser(userId) {
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new Error("can not find user");
    return user;
}
const authService = {
    loginWithEmail,
    getUser,
};
exports.default = authService;
//# sourceMappingURL=auth.service.js.map