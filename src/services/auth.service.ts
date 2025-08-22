import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import config from "@config/config";
import User from "@models/User";
import userService from "@services/user.service";

// 필요 시 활성화 (현재 이 파일에서는 사용 안 함)
const googleClient = new OAuth2Client(config.google.clientId);

// ✅ login과 signup 모두 이 타입을 반환하도록 변경
type AuthResult = {
  user: any;      // 필요 시 @models/User 타입으로 대체
  token: string;
};

type LoginWithEmailParams = {
  email: string;
  password: string;
};

// 필요 시 주석 해제하여 사용
// type LoginWithGoogleParams = { idToken: string };
// export async function loginWithGoogle({ idToken }: LoginWithGoogleParams): Promise<LoginResult> {
//   const ticket = await googleClient.verifyIdToken({
//     idToken,
//     audience: google.clientId,
//   });
//   const { email, name } = ticket.getPayload() as { email: string; name: string };

//   let user = await User.findOne({ email });
//   if (!user) {
//     const salt = await bcrypt.genSalt(10);
//     const newPassword = await bcrypt.hash(String(Math.floor(Math.random() * 1e8)), salt);
//     user = await new User({ name, email, password: newPassword }).save();
//   }
//   const token: string = await user.generateToken();
//   return { user, token };
// }

async function loginWithEmail({
    email,
    password,
  }: LoginWithEmailParams): Promise<AuthResult> {
    const user = await User.findOne({ email }).select("-createdAt -updatedAt -__v");
    if (!user) {
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
    }
  
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
    }
  
    const token: string = await user.generateToken();
    return { user, token };
  }
  
  async function getUser(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new Error("can not find user");
    return user;
  }

  
 //회원가입을 처리하고 토큰을 발급하는 함수
 //@param createUserData 회원가입에 필요한 데이터
 //@returns 생성된 사용자와 인증 토큰
 
async function register(createUserData: any): Promise<AuthResult> {
    // 1. user.service를 호출하여 DB에 사용자를 생성합니다.
  const user = await userService.createUser(createUserData);

    // 2. 생성된 사용자를 기반으로 토큰을 발급합니다.
  const token: string = await user.generateToken();

    // 3. 사용자 정보와 토큰을 함께 반환합니다.
  return { user, token };
}

  
  const authService = {
    loginWithEmail,
    getUser,
    register,
  };

export default authService;