"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const messages = result.error.issues.map((i) => i.message).join("\n");
        return res.status(400).json({ status: "fail", message: messages });
    }
    // 파싱/변환 결과를 사용하도록 교체
    req.body = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map