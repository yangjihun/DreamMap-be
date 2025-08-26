import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema({
  resourceType: { type: String, enum: ["course", "study"], default: "course" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String },
  rating: { type: Number },
  provider: { type: String },
  isComplete: { type: Boolean, default: false },
});

const pathSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String] },
    duration: { type: String },
    resources: [resourceSchema],
  },
  { _id: true }
);

const roadmapSchema = new Schema(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    plans: [
      {
        period: {
          type: String,
          enum: ["3months", "6months", "1year"],
          default: "3months",
        },
        paths: [pathSchema],
      },
    ],
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export { Roadmap };
