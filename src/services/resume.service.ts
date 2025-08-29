import Resume, { ResumeDoc, Item } from "@models/Resume";
import { Types } from "mongoose";

async function createFromPdf(
  userId: string | Types.ObjectId,
  resumeTitle: string,
  parsedSections: Record<string, string[]>
): Promise<ResumeDoc> {
  // [추가] titleKeywords를 서비스 내에서 사용할 수 있도록 정의
  const titleKeywords = [
    "기본 정보", "학력", "기술 스택", "프로젝트 경험",
    "활동", "수상", "자기소개"
  ];

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
        
        // 모든 텍스트를 하나로 합친 후, 줄바꿈 기준으로 나눕니다.
        const allLines = (contentArray as string[]).join('\n').split('\n');

        allLines.forEach(line => {
          const cleanedLine = cleanText(line);
          if (!cleanedLine) return;

          const isNewProjectTitle = !cleanedLine.startsWith('•');

          if (isNewProjectTitle) {
            if (currentTitle) {
              projects.push({
                title: currentTitle,
                text: currentTextLines.join('\n').trim()
              });
            }
            currentTitle = cleanedLine;
            currentTextLines = [];
          } else {
            currentTextLines.push(cleanedLine.replace(/^•\s*/, "").trim());
          }
        });

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
    }).filter(session => {
      const title = session.title;

      // 규칙: 주요 키워드로 시작하는 제목은 절대 제거하지 않는다.
      if (titleKeywords.some(keyword => title.startsWith(keyword))) {
          return true; // 주요 섹션이므로 유지
      }

      // 그 외의 제목(예: BAPAGO (...))이 괄호를 포함하면 제거
      if (title.includes('(')) {
          return false;
      }

      // 내용이 비어있는 경우도 제거
      return session.items.length > 0 && session.items.some(item => item.text.trim() !== "");
  });
  
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