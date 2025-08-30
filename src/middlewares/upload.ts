import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { analyzePdfLayout } from '../services/azure.service';
import AppError from "@utils/appError";

export const uploadPdf = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 20 * 1024 * 1024},
}).single("file");


// PDF 분석 미들웨어
export async function analyzePdfMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Multer가 처리한 파일 가져오기
    const file = req.file;
    if (!file) {
      // 파일이 없으면 다음 미들웨어로 넘어감 (파일 업로드가 선택적인 경우)
      return next(); 
    }

    // application/pdf 타입인지 확인
    if (file.mimetype !== 'application/pdf') {
      return next(new AppError('PDF 파일만 업로드 가능합니다.', 400));
    }

    // azure.service.ts의 함수를 호출하여 PDF 분석 및 그룹화 실행
    const parsedSections = await analyzePdfLayout(file.buffer);

    // -------------------- [추가된 부분 시작] --------------------
    // azure.service.ts가 반환한 최종 결과를 터미널에 출력합니다.
    console.log("--- Azure AI 분석 결과 (parsedSections) ---");
    console.log(parsedSections);
    console.log("-------------------------------------------");
    // -------------------- [추가된 부분 끝] --------------------

    // 분석된 결과를 req.body에 추가하여 다음 컨트롤러로 전달
    req.body.parsedSections = parsedSections;

    return next();

  } catch (error: any) {
    // 오류 발생 시 400 상태 코드와 에러 메시지 반환
    return next(error);
  }
};
