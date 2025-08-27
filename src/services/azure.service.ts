import {
    DocumentAnalysisClient, AzureKeyCredential, AnalyzeResult, AnalyzedDocument} from '@azure/ai-form-recognizer';
  import config from '@config/config';
  
  // 1. config 파일을 이용해 Azure 클라이언트 초기화
  const azureClient = new DocumentAnalysisClient(
    config.azure.endpoint!,
    new AzureKeyCredential(config.azure.key!)
  );
  
  /**
   * Azure Layout 결과를 섹션 제목별로 그룹화하는 [개선된] 함수
   * @param {AnalyzeResult<AnalyzedDocument>} layoutResult - Azure Document Intelligence의 Layout 분석 결과
   * @returns {Record<string, string[]>} - 섹션 제목이 key이고, 내용이 배열인 객체
   */
  function groupSections(layoutResult: AnalyzeResult<AnalyzedDocument>): Record<string, string[]> {
    const groupedData: Record<string, string[]> = {};
    let currentTitle: string | null = null;
  
    // 제목으로 판단할 키워드 목록
    const titleKeywords = [
      "기본 정보", "학력", "기술 스택", "프로젝트 경험",
      "활동", "수상", "자기소개"
    ];
  
    // AI가 분석한 모든 문단 목록을 확인
    if (layoutResult && layoutResult.paragraphs) {
      layoutResult.paragraphs.forEach(p => {
        const content = p.content.trim();
        
        // 이 문단이 제목인지 판단 (AI가 제목이라고 하거나, 우리가 정한 키워드를 포함하는 경우)
        const isTitle = titleKeywords.some(keyword => content.includes(keyword));
  
        if (p.role === 'sectionHeading' || isTitle) {
          currentTitle = content; // 현재 제목을 업데이트
          groupedData[currentTitle] = []; // 새 그룹 생성
        } else if (currentTitle) {
          // 제목이 아닌 일반 내용이면 현재 그룹에 추가
          groupedData[currentTitle].push(content);
        }
      });
    }

    return groupedData;
}

/**
 * PDF 파일 버퍼를 받아 Azure Layout 모델로 분석하고, 결과를 섹션별로 그룹화하여 반환합니다.
 * @param {Buffer} buffer - PDF 파일의 버퍼 데이터
 * @returns {Promise<Record<string, string[]>>} - 섹션별로 정리된 데이터 객체를 담은 Promise
 */
export async function analyzePdfLayout(buffer: Buffer): Promise<Record<string, string[]>> {
    const poller = await azureClient.beginAnalyzeDocument("prebuilt-layout", buffer);
    
    // 원본 결과 그대로 받기
    const result = await poller.pollUntilDone();
  
    // 그룹화 함수를 호출하여 결과 정리
    const groupedResult = groupSections(result);
  
    return groupedResult; // 정리된 결과를 반환
  }
  
  // export default { analyzePdfLayout }; // 필요에 따라 기본 export 사용 가능