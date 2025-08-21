import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import config from "@config/config";
import User from "@models/User";

// 필요 시 활성화 (현재 이 파일에서는 사용 안 함)
const googleClient = new OAuth2Client(config.google.clientId);

type LoginWithEmailParams = {
  email: string;
  password: string;
};

type LoginResult = {
  user: any;      // 필요 시 @models/User 타입으로 대체
  token: string;
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
  }: LoginWithEmailParams): Promise<LoginResult> {
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
  
  const authService = {
    loginWithEmail,
    getUser,
  };

export default authService;