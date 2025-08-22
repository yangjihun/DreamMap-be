export const roadmapPrompt = (location: String, interestJob: String) =>
  `
- 지역(location): ${location}
- 관심 직무(interestJob): ${interestJob}

규칙:
- 한국어로 작성.
- 3개월, 6개월, 1년 로드맵을 단계별(paths)로 제시.
- 각 단계는 interestJob 기반으로 기술/학습 목표를 맞춤 설계.
- 단계 난이도는 점진적 상승: 기초 → 실무 → 프로젝트/포트폴리오.
- skills는 각 단계에서 반드시 학습/적용할 기술(최대 3개) 포함. 예: "React", "React-Query" IT 기술스택 용어로.
- duration은 단계 소요 기간으로 표시. 예: "3주", "4주".

리소스 작성:
- location과 언어/시간대/접근성을 우선.
- 각 단계 최소 1개, 최대 2개 resource.
- 추천 리소스는 interestJob과 관련.
- location은 시/군/구 또는 "Online" 명시.
- price는 통화 기호 포함, 모르면 "N/A".
- rating은 1~5 소수점 허용, 모르면 null.
- provider는 기관/주관사/플랫폼명.
- 중복 최소화.
`;
