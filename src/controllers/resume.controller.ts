import { Request, Response } from "express";
const Resume = require("@models/Resume");

const resumeController = {
  textUpload: async (req: Request, res: Response) => {
    try {
        const {text} = req.body;
        res.status(200).json({ status:'success', data:text})
    } catch(error: any) {
        res.status(400).json({status:'fail',error:error.message});
    }
  },
  getResume: async (req: Request, res: Response) => {
    try {
        const {userId} = req as Request & {userId: string};
        const resumeDoc = await Resume.findOne({userId});
        res.status(200).json({status: "success", data: resumeDoc});
    } catch(error: any) {

    }
  }
};

export default resumeController;