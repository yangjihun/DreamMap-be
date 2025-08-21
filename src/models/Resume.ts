const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  title: { type: String, default: "title" },
  text: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  review: { type: String },
}, { _id: false });

const sessionSchema = new Schema({
  key: { 
    type: String, 
    required: true, 
    enum: ['intro', 'body', 'closing']
  },
  title: { type: String, required: true },
  items: { type: [itemSchema], default: [] },
  wordCount: { type: Number, default: 0 },
}, { _id: false });

const resumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, default: "title" },
  totalCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  sessions: { type: [sessionSchema], default: [] },
}, { timestamps: true });

resumeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Resume", resumeSchema);
