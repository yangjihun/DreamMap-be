import { Request, Response, NextFunction } from "express";
import userService from "@services/user.service";


const userController = {
  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password, region, interestJob, level, school, major, career, skill, loginType } = req.body;
      const data = await userService.createUser({ 
        email,
        name,
        password,
        region,        
        interestJob,   
        level,         
        school,
        major,
        career,
        skill,
        loginType
        });
      return res.status(201).json({ status: "success", user: data });
    } catch (error: any) {
      // Mongoose ValidationError 포맷 처리
      if (error?.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        error = new Error(messages.join("\n"));
        (error as any).status = 400;
      }
      return next(error);
    }
  },
};

export default userController;
