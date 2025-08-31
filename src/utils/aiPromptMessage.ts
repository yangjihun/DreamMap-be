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
- location은 시/군/구 또는 "온라인" 명시.
- price는 통화 기호 포함, 모르면 "N/A".
- rating은 1~5 소수점 허용, 모르면 null.
- provider는 기관/주관사/플랫폼명.
- 중복 최소화.`;

import { Resume, Session, Item } from "@models/Resume";

export const resumeReviewPrompt = (resume: Resume) => `
시스템 지시:
당신의 유일한 출력은 JSON 객체 하나여야 합니다.
설명, 인사말, 코드 블록(\`\`\`), 주석, 추가 텍스트를 절대 포함하지 마세요.

요구사항:
- JSON만 출력하세요.
- 키는 반드시 review, score, wordCount 세 개만 포함하세요.
- review: 전체적인 한국어 요약/평가(명확하고 간결하게).
- score: 0~100 사이의 숫자(정수 또는 실수 허용). 최대 100점 만점.
- wordCount: review의 공백 기준 단어 수(모델 추정치, 서버에서 재계산 가능).
- 추가 속성 금지.

출력 예시(참고용, 그대로 복사 금지):
{"review":"...", "score":85}

아래는 유저의 리쥬메입니다.

제목: ${resume.title}

${resume.sessions
  .map(
    (session: Session) => `
섹션: ${session.title}
${session.items
  .map((item: Item) => {
    let t = `${item.title}`;
    if (item.company) t += `\n${item.company}`;
    if (item.role) t += `\n${item.role}`;
    if (item.startDate && item.endDate)
      t += `\n(${item.startDate} ~ ${item.endDate})`;
    t += `\n  ${item.text}`;
    return t;
  })
  .join("\n")}
`
  )
  .join("\n")}

이 리쥬메를 좀 엄격하게 평가하여 위의 JSON 스펙에 맞춰 출력하세요. 그리고 간략한 피드백도 해주세요.(점수가 왜 깍였는지)
우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라.
`;

export const itemPatchPrompt = (item: any) => `
아래는 유저의 리쥬메의 한 섹션의 한 항목이다.
${item.title}
${item.text}

그리고 아래는 이 세션에 대한 피드백이다.
${item.review}

-피드백을 반영해 내용을 수정한다.
-너의 서술은 모두 제거한다.
-불릿은 반드시 • 로 시작하고 * 는 사용하지 않는다.
-불릿 개수는 내용에 맞게 조정한다.
-문장은 간결하고 강렬하게 작성한다.
-각 불릿은 줄바꿈으로만 구분한다.

영어로 작성하라.

`;

export const introItemPrompt = (item: any) =>
  `너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중 "자기소개(요약)" 섹션이다.  
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  

- 지원자의 자신감이 드러나는가? 지원자의 열정이 보이는가? 
- 불필요하게 장황하지 않고 간결하면서도 설득력 있는가?  

${item.title}  
${item.text}  

*와 #는 사용하지 않는다. **는 사용하지 않는다.
이 파트는 자기 소개 파트이기 때문에 좀 더 어떤 사람인지 IT 분야에 열정이 있는지 잘 표현했느냐에 초점을 맞춰 평가하라.
이 질문의 해답은 3줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const relatedItemPrompt = (item: any) =>
  `너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중 "관련경력" 섹션이다.  
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  

- 지원자의 경력이 IT 직업에에 적합한가?
- 불필요하게 장황하지 않고 간결하면서도 설득력 있는가?  
- 지원자의 IT 분야야 능력이 표현되였는가?

${item.title}  
${item.text}  

*와 #는 사용하지 않는다. **는 사용하지 않는다.
이 파트는 관련경력이기 때문에 좀 더 상세하게 평가하라. 하지만 잘 한건 칭찬해줘야 된다.
이 질문의 해답은 3줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const experienceItemPrompt = (item: any) =>
  `너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중 "경력(직무 경험)" 섹션이다.  
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  

- 잘 드러난 강점이나 역량은 무엇인가? (예: 문제 해결, 팀워크, 고객 대응, 책임감 등)  
- IT 직무와 간접적으로라도 연결될 수 있는 경험이나 역량은 무엇인가?  
- 더 구체적으로 보강해야 할 부분은 무엇인가? (성과 수치, 사용한 기술, 기여도 등)  

${item.title}  
${item.startDate} ~ ${item.endDate}  
${item.text}  

*와 #는 사용하지 않는다. **는 사용하지 않는다.
우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라.
관련 경력이 아니면 이 경험을 잘 진술했는지 평가하라.
이 질문의 해답은 4줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const projectItemPrompt = (item: any) =>
  `너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중중 "프로젝트 경험" 섹션이다.  
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  

- 프로젝트의 목표와 결과물이 명확하게 서술되어 있는가?  
- 본인의 역할과 기여도가 분명히 구분되는가?  
- 사용한 기술 스택과 문제 해결 능력이 드러나는가?  
- 성과가 정량적(숫자, 결과) 또는 정성적으로 설명되는가?  

${item.title}  
${item.startDate} ~ ${item.endDate}  
${item.text}  

*와 #는 사용하지 않는다. **는 사용하지 않는다.
우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라. 
마지막으로, 이 프로젝트가 실제 IT 기업 면접에서 긍정적으로 인정받을 가능성을 **%로 추정**하고, 그 이유를 간단히 설명하라.  
이 질문의 해답은 4줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const activityItemPrompt = (item: any) => `
너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중 "활동" 섹션이다.  
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  
${item.title}  
${item.startDate} ~ ${item.endDate}  
${item.text}  

- 활동의 목표와 결과물이 명확하게 서술되어 있는가?  
- 본인의 역할과 기여도가 분명히 구분되는가?  
- 리더쉽이 드러나는가? 팀워크가 드러나는가?
- 어떤 스킬이 드러나는가?

*와 #는 사용하지 않는다. **는 사용하지 않는다.
우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라.
이 질문의 해답은 4줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const extractTextToJSON = (text: string) => `
아래는 유저의 리쥬메 전체 내용이다.
${text}

아래 텍스트를 주어진 스키마(JSON)로만 추출해 출력하라. 추가 설명/코드블록 금지, 스키마 밖 키 금지.

[섹션 공통 규칙]
- 기본: item.text는 각 줄이 '• '로 시작하며 줄바꿈(\n)으로 구분한다. ** 제일 중요하다!!
- Each bullet point should be separated by a newline character (\n). !! important!!
- 예외1: PERSONAL INFO(한국어면 "개인정보") 섹션의 item.text는 bullet 없이 평문으로 넣는다.
- 예외2: SKILLS 섹션의 item.text는 bullet 없이, 한 아이템 내 스킬들을 쉼표+공백(", ")로 구분한다.

[PERSONAL INFO]
- 섹션 제목: 영어면 "PERSONAL INFO", 한국어면 "개인정보".
- 이메일(mail/gmail), GitHub, 기타 연락처/링크를 각각 아이템으로 추가한다.
- 이 섹션의 item.text는 bullet을 붙이지 않는다.

[EDUCATION]
- item.title에는 학교 이름만 넣는다.
- item.text는 빈 문자열("")로 둔다.
- major에는 전공명을 넣는다.
- GPA는 반드시 추출하여 item.GPA에 넣고, 소수점 둘째 자리까지 포맷한다(예: 3.87).
- EDUCATION 섹션에는 item 하나밖에 없다.

[SKILLS]
- bullet 제거(평문).
- 한 아이템의 스킬들은 ", "로 구분한다.

[경력 companyOrRole 규칙]
- 회사명이 있으면 companyOrRole = 회사명.
- 회사명이 없고 역할/직책(role/position/title)이 있으면 companyOrRole = 그 역할.
- 둘 다 없으면 companyOrRole = "".


[oldText 규칙]
- oldText는 빼라.


import { Schema, model, Model, HydratedDocument, Types } from "mongoose";

export interface Item {
  title: string;
  text: string;
  startDate?: string;
  endDate?: string;
  review?: string;
  company?: string;
  role?: string;
  degree?: string;
  GPA?: Number;
}

export interface Session {
  key: string;
  title: string;
  items: Item[];
  wordCount: number;
}

export interface Resume {
  userId: Types.ObjectId;
  title: string;
  totalCount: number;
  score: number;
  starred: boolean;
  sessions: Session[];
  status: string;
  lastModified: string;
  review: string;
}

export interface ResumeMethods {
  toJSON(): any;
}

export type ResumeDoc = HydratedDocument<Resume, ResumeMethods>;
export type ResumeModel = Model<Resume, {}, ResumeMethods>;

const itemSchema = new Schema(
  {
    title: { type: String, default: "title" },
    company: { type: String },
    role: { type: String },
    text: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    review: { type: String },
    degree: { type: String },
    GPA: { type: Number },
  },
  { _id: false }
);

const sessionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    title: { type: String, required: true },
    items: { type: [itemSchema], default: [] },
    wordCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const resumeSchema = new Schema<Resume, ResumeModel, ResumeMethods>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "title" },
    totalCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    starred: { type: Boolean, default: false },
    sessions: { type: [sessionSchema], default: [] },
    status: { type: String, default: "draft" },
    lastModified: { type: String, default: "2024년 1월 15일" },
    review: { type: String },
  },
  { timestamps: true }
);

resumeSchema.methods.toJSON = function () {
  const obj = this.toObject() as any;
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Resume = model<Resume, ResumeModel>("Resume", resumeSchema);
export default Resume;
export { Resume };

저장할때, 리쥬메에 나열 된 세션 순서대로 저장하라.

`;

/*



export const skillItemPrompt = (item: any) =>
  `너는 IT 기업의 시니어 채용 담당자다.  
아래는 지원자의 레쥬메 중 "기술(스킬)" 항목이다.
따라서 보통 기술스택은 여러줄로 종목별로 한줄로 나열되여있다.  
다음 기준에 따라 4줄 이내로 피드백을 작성하라:  

- IT 분야와 직접 관련성이 있는가?  
- 최신 기술 트렌드에 부합하는가, 너무 추상적이지 않은가?  
- 포맷과 표현이 명확하고 일관적인가?  

${item.title}  
${item.text}  

우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라.
이 질문의 해답은 4줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;

export const degreeItemPrompt = (item: any) => `
아래는 지원자의 레쥬메 중 "학력" 항목이다.
이 항목의 내용을 검토하고, 다음 기준에 따라 피드백을 작성하라:  

- 학력의 정보가 명확하게 표시되었는가?  
- 학교와 전공, 졸업 여부 등이 분명한가?  
- 학력 수준이 지원자의 경력과 관련성이 있는가?  
- 학력 외 포함된 다른 내요을 평가하라.

${item.title}  
${item.text}  
우선 긍정적인 점을 평가하고 그 이후에 개선할 부분을 평가하라.
이 질문의 해답은 4줄 이내로 작성하라(최대한 간략하게 유저 안내문 같은 불필요한것은 빼고 핵심만 포함하라). 
항목에 드러난 내용만 평가하라. 그리고 들여쓰기랑 글자 스타일 모두 제거하고 줄바꿈 최대 한줄로 하라.`;*/
