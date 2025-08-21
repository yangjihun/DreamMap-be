import bcrypt from "bcryptjs";
import userRepo, { CreateUserInput } from "@repos/user.repo";

const SALT_ROUNDS = 10;

type CreateUserParams = Omit<CreateUserInput, "password"> & {
  password: string; // 서비스에선 비번 필수
};

type CreateUserResult = {
  id: string;
  email: string;
  name: string;
};

// Error 객체에 status 속성을 부여하기 위한 보조 타입
type ErrorWithStatus = Error & { status?: number };


async function createUser(params: CreateUserParams): Promise<CreateUserResult> {
  const { email, name, password } = params;

  if (!password) {
    const err: ErrorWithStatus = new Error("비밀번호를 입력해주세요");
    err.status = 400;
    throw err;
  }

  const exists = await userRepo.findByEmail(email);
  if (exists) {
    const err: ErrorWithStatus = new Error("이미 가입된 유저입니다");
    err.status = 409;
    throw err;
  }

  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_ROUNDS));

  const newUser = await userRepo.create({
    ...params,
    password: hash,
    level: params.level ?? "customer",
    loginType: params.loginType ?? "local",
  });

  return { id: String(newUser._id), email: newUser.email, name: newUser.name };
}


const userService = {
  createUser,
};

export default userService;
