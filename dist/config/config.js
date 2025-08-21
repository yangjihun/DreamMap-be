"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
// process.env에서 필요한 값들을 읽어서 config 객체로 정리
// 이렇게 하면 코드 내에서 process.env를 직접 쓰지 않고,
// config를 통해 접근할 수 있어 관리와 테스트가 편리해집니다.
const config = {
    env: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development",
    port: (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 5000,
    jwt: {
        secret: (_c = process.env.JWT_SECRET_KEY) !== null && _c !== void 0 ? _c : "your-secret",
        expiresIn: "1d",
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
    },
    mongo: {
        uri: process.env.MONGODB_URI_PROD,
    },
};
// 다른 모듈에서 config를 불러와 사용할 수 있도록 export
exports.default = config;
//# sourceMappingURL=config.js.map