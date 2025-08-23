import { Request, Response, NextFunction } from "express";
import authService from "@services/auth.service";

const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. auth.service의 register 함수에 요청 본문을 그대로 전달합니다.
      const { user, token } = await authService.register(req.body);

      // 2. 서비스로부터 받은 결과(사용자, 토큰)를 클라이언트에 응답합니다.
      return res.status(201).json({ status: "success", user, token });

    } catch (error: any) {
      return next(error); // 에러는 다음 미들웨어로 전달
    }
  },

  loginWithEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.loginWithEmail(req.body);
      return res.status(200).json({ status: "success", ...result });
    } catch (error) {
      return next(error);
    }
  },

  // 필요하면 구글 로그인 활성화
  // loginWithGoogle: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const result = await authService.loginWithGoogle({ idToken: req.body.token });
  //     return res.status(200).json({ status: "success", ...result });
  //   } catch (err) {
  //     return next(err);
  //   }
  // },

  getUser: async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getUser(req.userId!);
      return res.status(200).json({ status: "success", user });
    } catch (err) {
      return next(err);
    }
  },
};



export default authController;
