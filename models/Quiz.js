const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  className: { type: String },
  subject: { type: String },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  duration: { type: Number, default: 10 }, // in minutes
  status: { type: String, enum: ["upcoming", "active", "completed"], default: "upcoming" },
  type: { type: String, enum: ["normal", "preloaded"], default: "normal" }
}, { timestamps: true });

module.exports = mongoose.model("Quiz", QuizSchema);
