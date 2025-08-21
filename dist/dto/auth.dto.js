"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
// 회원가입 DTO (런타임 검증 + 타입 추론)
exports.signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "유효한 이메일을 입력하세요." }),
    password: zod_1.z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
    name: zod_1.z.string().min(1, { message: "이름은 필수입니다." }),
    region: zod_1.z.string().min(1, { message: "region은 필수입니다." }),
    interestJob: zod_1.z.string().min(1, { message: "관심 직무는 필수입니다." }),
    // 선택 필드 (비워오면 undefined)
    school: zod_1.z.string().optional(),
    major: zod_1.z.string().optional(),
    career: zod_1.z.string().optional(),
    skill: zod_1.z.string().optional(),
    // 선택: 기본값은 모델에서 customer/local
    level: zod_1.z.enum(["customer", "pro"]).optional(),
    loginType: zod_1.z.enum(["local", "google", "github"]).optional()
});
// 로그인 DTO
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "유효한 이메일을 입력하세요." }),
    password: zod_1.z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});
//# sourceMappingURL=auth.dto.js.map