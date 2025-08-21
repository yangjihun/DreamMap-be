import { Request, Response, NextFunction } from "express";
import authService from "@services/auth.service";

const authController = {
  loginWithEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.loginWithEmail(req.body);
      return res.status(200).json({ status: "success", ...result });
    } catch (err) {
      return next(err);
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
