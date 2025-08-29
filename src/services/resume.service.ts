import Resume, { ResumeDoc } from "@models/Resume";
import { Types } from "mongoose";
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
  AnalyzeResult,
  AnalyzedDocument
} from '@azure/ai-form-recognizer';
import config from '@config/config';

// Azure 클라이언트 초기화
const azureClient = new DocumentAnalysisClient(
  config.azure.endpoint!,
  new AzureKeyCredential(config.azure.key!)
);

// 섹션 그룹화 함수
function groupSections(layoutResult: AnalyzeResult<AnalyzedDocument>): Record<string, string[]> {
  const groupedData: Record<string, string[]> = {};
  let currentTitle: string | null = null;

  const titleKeywords = [
    "기본 정보", "학력", "기술 스택", "프로젝트 경험",
    "활동", "수상", "자기소개"
  ];

  if (layoutResult && layoutResult.paragraphs) {
    layoutResult.paragraphs.forEach(p => {
      const content = p.content.trim();
      const isTitle = titleKeywords.some(keyword => content.includes(keyword));

      if (p.role === 'sectionHeading' || isTitle) {
        currentTitle = content;
        groupedData[currentTitle] = [];
      } else if (currentTitle) {
        groupedData[currentTitle].push(content);
      }
    });
  }
  return groupedData;
}

// Azure PDF 분석 서비스 함수
export async function analyzePdfLayout(buffer: Buffer): Promise<Record<string, string[]>> {
  const poller = await azureClient.beginAnalyzeDocument("prebuilt-layout", buffer);
  const result = await poller.pollUntilDone();
  const groupedResult = groupSections(result);
  return groupedResult;
}

// PDF 분석 결과를 받아 이력서를 생성하는 서비스 함수
async function createFromPdf(
  userId: string | Types.ObjectId,
  resumeTitle: string,
  parsedSections: Record<string, string[]>
): Promise<ResumeDoc> {
  const sessions = Object.entries(parsedSections)
    .map(([sectionTitle, contentArray]) => {
      let items;

      // "프로젝트 경험" 섹션일 경우 특별 처리
      if (sectionTitle.includes("프로젝트 경험")) {
        items = [];
        let currentProject = { title: "", text: "" };

        (contentArray as string[]).forEach(line => {
          if (line.includes("◆")) {
            if (currentProject.title) {
              currentProject.text = currentProject.text.trim();
              items.push(currentProject);
            }
            currentProject = { title: line.replace(/◆|-/g, "").trim(), text: "" };
          } else {
            currentProject.text += line + "\n";
          }
        });

        if (currentProject.title) {
          currentProject.text = currentProject.text.trim();
          items.push(currentProject);
        }
      
      } else if (sectionTitle.includes("활동")) {
        // '활동' 섹션은 각 줄을 별개의 아이템으로 분리합니다.
        items = (contentArray as string[]).map(line => {
          // '-' 기호를 기준으로 제목과 설명을 나눌 수 있지만, 여기서는 전체를 text로 저장합니다.
          // 제목은 '-' 앞부분을 사용하거나, 없다면 첫 5단어를 사용합니다.
          const title = line.split(' - ')[0] || line.split(' ').slice(0, 5).join(' ');
          return {
            title: title.trim(),
            text: line.trim(),
          };
        });

      } else {
        // 그 외 다른 섹션들은 하나의 아이템으로 합치기
        const combinedText = (contentArray as string[]).join('\n');
        items = [{
          title: sectionTitle,
          text: combinedText,
        }];
      }

      return {
        key: sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: sectionTitle,
        items: items,
        wordCount: items.reduce((acc, item) => acc + (item.text?.length || 0), 0),
      };
    })
    .filter(session => session.items.length > 0 && session.items.some(item => item.text.trim() !== ""));

  const newResume = new Resume({
    userId,
    title: resumeTitle,
    sessions,
    status: 'draft',
  });

  await newResume.save();
  return newResume;
}

const resumeService = {
  createFromPdf,
};

export default resumeService;