"use strict";
// import express from "express";
// import mongoose from "mongoose";
// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import indexRouter from "@routes/index";
// dotenv.config();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use("/api", indexRouter);
// const mongoURI = process.env.MONGODB_URI_PROD;
// if (!mongoURI) {
//   throw new Error("MONGODB_URI_PROD is not set");
// }
// mongoose
//   .connect(mongoURI)
//   .then(() => console.log("mongoose connected"))
//   .catch((err: unknown) => console.log("DB connection failed", err));
// const PORT = Number(process.env.PORT) || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`\n🚀 API running at http://localhost:${PORT}`);
// });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("@routes/index"));
const config_1 = __importDefault(require("@config/config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use("/api", index_1.default);
// if (!config.mongo.uri) {
//   throw new Error("MONGODB_URI_PROD is not set");
// }
// mongoose
//   .connect(config.mongo.uri)
//   .then(() => console.log("mongoose connected"))
//   .catch((err: unknown) => console.log("DB connection failed", err));
// const PORT = Number(config.port) || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`\n🚀 API running at http://localhost:${PORT}`);
// });
async function connectDB() {
    try {
        const mongoURI = config_1.default.mongo.uri;
        if (!mongoURI) {
            throw new Error("MongoDB URI가 설정되지 않았습니다. (.env / config.ts 확인)");
        }
        // Mongoose v8: 옵션 대부분 기본값. 타임아웃만 명시(필요시)
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // 10초 내 연결 실패 시 에러
        });
        console.log("✅ MongoDB 연결 성공");
        mongoose_1.default.connection.on("error", (err) => {
            console.error("MongoDB 연결 에러:", err);
        });
        const PORT = Number(config_1.default.port) || 5000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`\n🚀 API running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("서버 시작 중 오류:", err);
        process.exit(1);
    }
}
connectDB();
exports.default = app;
//# sourceMappingURL=app.js.map