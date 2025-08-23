import { Resume } from "@models/Resume";
import { Roadmap } from "@models/Roadmap";
import { Request, Response } from "express";
import geminiController from "./gemini.controller";
import { User } from "@models/User";

const roadmapController = {
  createRoadmap: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const resume = await Resume.findById(resumeId).populate<{ userId: User }>(
        {
          path: "userId",
          model: "User",
          select: "major career skill region interestJob level",
        }
      );
      // 1. resume 찾기
      if (!resume) throw new Error("not found resume");

      // 2. resume에서 유저데이터 가져오기
      const user = resume.userId;
      const { major, career, skill, region, interestJob, level } = user;

      // 3. 유저데이터와 이력서 내용(sessions) gemini controller로 보내기
      if (!region || !interestJob)
        throw new Error("region 또는 interestJob이 없습니다.");

      const roadmapData = await geminiController.generateRoadmapContent({
        location: region,
        interestJob: interestJob,
      });
      //   4. gemini res로 로드맵 생성
      const newRoadmap = new Roadmap({
        resumeId,
        plans: roadmapData,
      });

      await newRoadmap.save();
      res.status(200).json({ status: "success", data: newRoadmap });
    } catch (error: any) {
      res.status(400).json({ status: "fail", error: error.message });
    }
  },

  getRoadmap: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const roadmap = await Roadmap.findOne({ resumeId });
      if (!roadmap) throw new Error("not found roadmap");

      res.status(200).json({ status: "success", data: roadmap });
    } catch (error: any) {
      res.status(400).json({ status: "fail", error: error.message });
    }
  },
};

export default roadmapController;
