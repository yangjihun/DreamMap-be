import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import indexRouter from "@routes/index";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", indexRouter);

const mongoURI = process.env.MONGODB_URI_PROD;
if (!mongoURI) {
  throw new Error("MONGODB_URI_PROD is not set");
}
mongoose
  .connect(mongoURI)
  .then(() => console.log("mongoose connected"))
  .catch((err: unknown) => console.log("DB connection failed", err));

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 API running at http://localhost:${PORT}`);
});
