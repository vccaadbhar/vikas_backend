const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // Question text
  options: [{ type: String, required: true }], // Array of options
  correctAnswer: { type: Number, required: true }, // Index of correct option
  explanation: { type: String }, // Optional
  subject: { type: String },
  className: { type: String },
  chapter: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
