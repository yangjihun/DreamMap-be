"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("@routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use("/api", index_1.default);
const mongoURI = process.env.MONGODB_URI_PROD;
if (!mongoURI) {
    throw new Error("MONGODB_URI_PROD is not set");
}
mongoose_1.default
    .connect(mongoURI)
    .then(() => console.log("mongoose connected"))
    .catch((err) => console.log("DB connection failed", err));
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 API running at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map