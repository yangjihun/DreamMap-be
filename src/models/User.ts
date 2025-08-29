import { Schema, model, Model, HydratedDocument } from "mongoose";
import jwt from "jsonwebtoken";
import config from "@config/config";

const { jwt: jwtCfg } = config;

/** 문서 필드 타입 */
export interface User {
  email: string;
  password: string;
  name: string;
  school?: string | null;
  major?: string | null;
  career?: string | null;
  skill?: string | null;
  region: string;
  interestJob: string;
  level: "customer" | "pro";
  loginType: "local" | "google" | "github";
}

/** 인스턴스 메서드 타입 */
export interface UserMethods {
  generateToken(): string;
}

/** 편의 타입들 */
export type UserDoc = HydratedDocument<User, UserMethods>;
export type UserModel = Model<User, {}, UserMethods>;

/** 스키마 */
const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    school: { type: String, default: null },
    major: { type: String, default: null },
    career: { type: String, default: null },
    skill: { type: String, default: null },
    region: { type: String },
    interestJob: { type: String },
    level: { type: String, enum: ["customer", "pro"], default: "customer" },
    loginType: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject() as any;
  obj.id = obj._id;
  delete obj.password;
  delete obj.updatedAt;
  delete obj.createdAt;
  delete obj.__v;
  return obj;
};

/** 인스턴스 메서드 */
userSchema.methods.generateToken = function (this: UserDoc): string {
  if (!jwtCfg.secret) {
    throw new Error("JWT secret not configured");
  }
  return jwt.sign({ id: this._id.toString() }, jwtCfg.secret, {
    expiresIn: jwtCfg.expiresIn,
  });
};

const User = model<User, UserModel>("User", userSchema);
export default User;
