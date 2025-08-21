// import express from "express";
// import mongoose from "mongoose";
// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import indexRouter from "@routes/index";
// dotenv.config();

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


import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import indexRouter from "@routes/index";
import config from "@config/config"; 

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", indexRouter);


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
    const mongoURI = config.mongo.uri;
    if (!mongoURI) {
      throw new Error("MongoDB URI가 설정되지 않았습니다. (.env / config.ts 확인)");
    }

    // Mongoose v8: 옵션 대부분 기본값. 타임아웃만 명시(필요시)
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10_000, // 10초 내 연결 실패 시 에러
    });

    console.log("✅ MongoDB 연결 성공");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB 연결 에러:", err);
    });

    const PORT = Number(config.port) || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("서버 시작 중 오류:", err);
    process.exit(1);
  }
}

connectDB();

export default app;
