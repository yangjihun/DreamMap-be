"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("@middlewares/validate.middleware");
const auth_dto_1 = require("@dto/auth.dto");
const user_controller_1 = __importDefault(require("@controllers/user.controller"));
const auth_controller_1 = __importDefault(require("@controllers/auth.controller"));
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.default.loginWithEmail);
router.post("/signup", (0, validate_middleware_1.validate)(auth_dto_1.signUpSchema), user_controller_1.default.createUser);
exports.default = router;
//# sourceMappingURL=auth.api.js.map