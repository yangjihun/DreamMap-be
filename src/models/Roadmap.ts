import { Schema } from "mongoose";

const resourceSchema = new Schema({
  resourceType: { type: String, enum: ["course", "study"], default: "course" },
  name: { type: String },
  location: { type: String },
  price: { type: String },
  rating: { type: Number },
  provider: { type: String },
});

const pathSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    skills: { type: [String] },
    duration: { type: String },
    resources: [resourceSchema],
  },
  { _id: true }
);

const roadmapSchema = new Schema(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    plan: {
      type: String,
      enum: ["3months", "6months", "1year"],
      default: "3months",
    },
    paths: [pathSchema],
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export { Roadmap };
