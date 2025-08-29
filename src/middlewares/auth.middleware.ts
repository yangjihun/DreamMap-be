import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, JsonWebTokenError } from "jsonwebtoken";
import config from "@config/config";
import User from "@models/User";
import AppError from "@utils/appError";

interface TokenPayload extends JwtPayload {
  id: string;
}

// 라우트 핸들러에서 req.userId를 쓰고 싶다면 이렇게 확장 타입을 사용
type AuthedRequest = Request & { userId?: string };

export const authenticate = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      return res.status(401).json({ status: "fail", message: "토큰 없음" });
    }

    const token = tokenString.replace("Bearer ", "");
    const payload = jwt.verify(token, config.jwt.secret!) as TokenPayload;

    req.userId = payload.id;
    return next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      // 토큰 관련 에러(유효하지 않은 토큰, 만료된 토큰 등)를 잡아서
      // 401 상태 코드를 가진 AppError로 변환합니다.
      return next(new AppError("유효하지 않은 토큰입니다.", 401));
    }
    return next(err);
  }
};

export const checkAdmin = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({ status: "fail", message: "권한 부족" });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};
