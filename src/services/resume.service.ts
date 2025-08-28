import Resume, { ResumeDoc, Item } from "@models/Resume";
import { Types } from "mongoose";
import { DocumentAnalysisClient, AzureKeyCredential, AnalyzeResult, AnalyzedDocument } from '@azure/ai-form-recognizer';
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

async function createFromPdf(
  userId: string | Types.ObjectId,
  resumeTitle: string,
  parsedSections: Record<string, string[]>
): Promise<ResumeDoc> {
  const sessions = Object.entries(parsedSections)
    .map(([sectionTitle, contentArray]) => {
      let items: Item[];

      const cleanText = (text: string) => {
        return text
          .replace(/^[●○·▪️◆]\s*/, "• ")
          .replace(/^#:/, "• 툴:")
          .trim();
      };

      if (sectionTitle.includes("프로젝트 경험")) {
        const projects: Item[] = [];
        let currentTitle = "";
        let currentTextLines: string[] = [];

        (contentArray as string[]).forEach(line => {
          const cleanedLine = cleanText(line);

          // [수정] 새 규칙: 글머리 기호(•)가 없는 줄은 새 프로젝트의 제목으로 간주
          if (!cleanedLine.startsWith('•')) {
            // 이전에 수집된 프로젝트가 있다면 먼저 배열에 추가
            if (currentTitle) {
              projects.push({
                title: currentTitle,
                text: currentTextLines.join('\n').trim()
              });
            }
            // 새 프로젝트 정보 초기화
            currentTitle = cleanedLine;
            currentTextLines = [];
          } else {
            // 글머리 기호가 있는 줄은 현재 프로젝트의 내용으로 추가
            // 내용 앞의 글머리 기호는 제거
            currentTextLines.push(cleanedLine.replace(/^•\s*/, "").trim());
          }
        });

        // 루프가 끝난 후 마지막으로 남아있는 프로젝트를 추가
        if (currentTitle) {
          projects.push({
            title: currentTitle,
            text: currentTextLines.join('\n').trim()
          });
        }
        items = projects;

      } else if (sectionTitle.includes("활동")) {
        items = (contentArray as string[]).map(line => {
          const cleanedLine = cleanText(line);
          const title = cleanedLine.split(' - ')[0] || cleanedLine.split(' ').slice(0, 5).join(' ');
          return {
            title: title.replace(/^•\s*/, "").trim(),
            text: cleanedLine.replace(/^•\s*/, "").trim(),
          };
        });

      } else {
        const combinedText = (contentArray as string[])
          .map(line => cleanText(line))
          .join('\n');
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