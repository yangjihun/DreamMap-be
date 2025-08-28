import { z } from "zod";

// 회원가입 DTO (런타임 검증 + 타입 추론)
export const signUpSchema = z.object({
  email: z.string().email({ message: "유효한 이메일을 입력하세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
  name: z.string().min(1, { message: "이름은 필수입니다." }),
  // region: z.string().min(1, { message: "region은 필수입니다." }),
  // interestJob: z.string().min(1, { message: "관심 직무는 필수입니다." }),

  // 선택 필드 (빈 문자열로 기본 세팅)
  school: z.string().optional().default(""),
  major: z.string().optional().default(""),
  career: z.string().optional().default(""),
  skill: z.string().optional().default(""),

  // 선택: 기본값은 모델에서 customer/local
  level: z.enum(["customer", "pro"]).optional(),
  loginType: z.enum(["local", "google", "github"]).optional(),
});

export type SignUpDto = z.infer<typeof signUpSchema>;

// 로그인 DTO
export const loginSchema = z.object({
  email: z.string().email({ message: "유효한 이메일을 입력하세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

export type LoginDto = z.infer<typeof loginSchema>;
