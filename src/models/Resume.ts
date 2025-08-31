import { Schema, model, Model, HydratedDocument, Types } from "mongoose";

export interface Item {
  title: string;
  text: string;
  startDate?: string;
  endDate?: string;
  review?: string;
  companyAddress?: string;
  oldText?: string;
  degree?: string;
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
  name: string;
}

export interface ResumeMethods {
  toJSON(): any;
}

export type ResumeDoc = HydratedDocument<Resume, ResumeMethods>;
export type ResumeModel = Model<Resume, {}, ResumeMethods>;

const itemSchema = new Schema(
  {
    title: { type: String, default: "title" },
    companyAddress: { type: String },
    text: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    oldText: { type: String },
    review: { type: String },
    degree: { type: String },
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
    name: { type: String },
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
