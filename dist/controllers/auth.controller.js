"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("@services/auth.service"));
const authController = {
    loginWithEmail: async (req, res, next) => {
        try {
            const result = await auth_service_1.default.loginWithEmail(req.body);
            return res.status(200).json({ status: "success", ...result });
        }
        catch (err) {
            return next(err);
        }
    },
    // 필요하면 구글 로그인 활성화
    // loginWithGoogle: async (req: Request, res: Response, next: NextFunction) => {
    //   try {
    //     const result = await authService.loginWithGoogle({ idToken: req.body.token });
    //     return res.status(200).json({ status: "success", ...result });
    //   } catch (err) {
    //     return next(err);
    //   }
    // },
    getUser: async (req, res, next) => {
        try {
            const user = await auth_service_1.default.getUser(req.userId);
            return res.status(200).json({ status: "success", user });
        }
        catch (err) {
            return next(err);
        }
    },
};
exports.default = authController;
//# sourceMappingURL=auth.controller.js.map