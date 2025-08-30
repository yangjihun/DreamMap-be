import {
    DocumentAnalysisClient, AzureKeyCredential, AnalyzeResult, AnalyzedDocument} from '@azure/ai-form-recognizer';
  import config from '@config/config';
  
  // 1. config 파일을 이용해 Azure 클라이언트 초기화
const azureClient = new DocumentAnalysisClient(
  config.azure.endpoint!,
  new AzureKeyCredential(config.azure.key!)
);
  
/**
 * PDF 파일 버퍼를 받아 Azure Layout 모델로 분석하고, 추출된 모든 텍스트를 하나의 문자열로 합쳐서 반환합니다.
 * @param {Buffer} buffer - PDF 파일의 버퍼 데이터
 * @returns {Promise<string>} - PDF의 전체 텍스트를 담은 Promise
 */
export async function analyzePdfLayout(buffer: Buffer): Promise<string> {
  const poller = await azureClient.beginAnalyzeDocument(
    "prebuilt-layout",
    buffer
  );
  const result = await poller.pollUntilDone();

  // 모든 단락('paragraphs')의 텍스트('content')를 추출하여 줄바꿈(\n)으로 연결합니다.
  const fullText = result.paragraphs?.map((p) => p.content).join("\n") ?? "";

  // 그룹화된 객체 대신 하나의 전체 텍스트 문자열을 반환합니다.
  return fullText;
}

// groupSections 함수는 더 이상 필요 없으므로 완전히 삭제합니다.
const azureService = {
  analyzePdfLayout,
};

export default azureService;



//   /**
//    * Azure Layout 결과를 섹션 제목별로 그룹화하는 [개선된] 함수
//    * @param {AnalyzeResult<AnalyzedDocument>} layoutResult - Azure Document Intelligence의 Layout 분석 결과
//    * @returns {Record<string, string[]>} - 섹션 제목이 key이고, 내용이 배열인 객체
//    */

// function groupSections(layoutResult: AnalyzeResult<AnalyzedDocument>): Record<string, string[]> {
//   const groupedData: Record<string, string[]> = {};
//   let currentTitle: string | null = null;
//   let isInProjectSection = false;  // 프로젝트 섹션 내부인지 추적

//   const titleKeywords = [
//     "기본 정보", "학력", "기술 스택", "프로젝트 경험",
//     "활동", "수상", "자기소개"
//   ];

//   // 프로젝트 제목으로 판단할 패턴들
//   const projectTitlePatterns = [
//     /^[A-Z][\w\s-]+\([^)]+\)$/,  // 예: "BAPAGO (Restaurant Discovery Web App)"
//     /^[A-Z][\w\s-]+$/,            // 예: "MediRoute", "Good-Vibe Clock"
//   ];

//   if (layoutResult && layoutResult.paragraphs) {
//     layoutResult.paragraphs.forEach(p => {
//       const content = p.content.trim();
      
//       // 주요 섹션 제목인지 확인
//       const isMainSection = titleKeywords.some(keyword => content.startsWith(keyword));
      
//       if (p.role === 'sectionHeading' || isMainSection) {
//         // 새로운 주요 섹션 시작
//         currentTitle = content;
//         groupedData[currentTitle] = [];
        
//         // 프로젝트 경험 섹션인지 확인
//         isInProjectSection = content.includes("프로젝트 경험") || content.includes("Projects");
//       } 
//       else if (isInProjectSection && currentTitle) {
//         // 프로젝트 섹션 내부에서 처리
//         const isProjectTitle = projectTitlePatterns.some(pattern => pattern.test(content));
        
//         if (isProjectTitle && !content.startsWith('•') && !content.startsWith('○') && !content.startsWith('·')) {
//           // 프로젝트 제목도 내용으로 추가 (구분을 위해)
//           groupedData[currentTitle].push(content);
//         } else {
//           // 일반 내용 추가
//           groupedData[currentTitle].push(content);
//         }
        
//         // 다음 주요 섹션이 시작되는지 확인 (활동, 수상 등)
//         const isNextMainSection = titleKeywords.slice(titleKeywords.indexOf("프로젝트 경험") + 1)
//           .some(keyword => content.startsWith(keyword));
        
//         if (isNextMainSection) {
//           // 새로운 주요 섹션 발견 - 프로젝트 섹션 종료
//           isInProjectSection = false;
//           currentTitle = content;
//           groupedData[currentTitle] = [];
//         }
//       }
//       else if (currentTitle) {
//         // 일반 섹션의 내용 추가
//         groupedData[currentTitle].push(content);
//       }
//     });
//   }

//   // 잘못 분리된 프로젝트들을 프로젝트 경험 섹션으로 병합
//   const projectSectionKey = Object.keys(groupedData).find(key => 
//     key.includes("프로젝트 경험") || key.includes("Projects")
//   );
  
//   if (projectSectionKey) {
//     const keysToMerge: string[] = [];
    
//     Object.keys(groupedData).forEach(key => {
//       // 프로젝트로 보이는 키들 찾기
//       if (key !== projectSectionKey && 
//           !titleKeywords.some(keyword => key.startsWith(keyword)) &&
//           (key.includes('(') || /^[A-Z][\w\s-]+/.test(key))) {
//         keysToMerge.push(key);
//       }
//     });
    
//     // 프로젝트들을 프로젝트 경험 섹션으로 병합
//     keysToMerge.forEach(projectKey => {
//       // 프로젝트 제목 추가
//       groupedData[projectSectionKey].push(projectKey);
//       // 프로젝트 내용 추가
//       groupedData[projectSectionKey].push(...groupedData[projectKey]);
//       // 원래 키 삭제
//       delete groupedData[projectKey];
//     });
//   }

//   return groupedData;
// }

// /**
//  * PDF 파일 버퍼를 받아 Azure Layout 모델로 분석하고, 결과를 섹션별로 그룹화하여 반환합니다.
//  * @param {Buffer} buffer - PDF 파일의 버퍼 데이터
//  * @returns {Promise<Record<string, string[]>>} - 섹션별로 정리된 데이터 객체를 담은 Promise
//  */
// export async function analyzePdfLayout(buffer: Buffer): Promise<Record<string, string[]>> {
//   const poller = await azureClient.beginAnalyzeDocument("prebuilt-layout", buffer);
  
//   // 원본 결과 그대로 받기
//   const result = await poller.pollUntilDone();

//   // 그룹화 함수를 호출하여 결과 정리
//   const groupedResult = groupSections(result);

//   return groupedResult; // 정리된 결과를 반환
// }
