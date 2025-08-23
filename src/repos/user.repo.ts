import User from "@models/User";

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  region: string;
  interestJob: string;
  school?: string | null;
  major?: string | null;
  career?: string | null;
  skill?: string | null;
  level?: "customer" | "pro";
  loginType?: "local" | "google" | "github"; 
};

async function findByEmail(email: string) {
  return User.findOne({ email });
}

async function create(input: CreateUserInput) {
  const doc = await User.create(input);
  return doc;
}

const userRepo = { findByEmail, create };
export default userRepo;
