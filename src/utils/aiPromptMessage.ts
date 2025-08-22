export const roadmapPrompt = (location: string, skill: string) =>
  `${location} 기준으로 1년차 ${skill}직무의 학습 로드맵을 한국어로 추천해줘. 결과에는 제목, 상세설명, 배워갈 수 있는 기술스택(구체적으로해줘 라이브러리라던지 프레임워크라던지 툴 이름이라던지, 최대 3개), 교육과정기간 이렇게 포함되어야돼.`;
