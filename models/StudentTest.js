const mongoose = require("mongoose");

const StudentTestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },

  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    selectedOption: { type: Number },   // which option student picked
    isCorrect: { type: Boolean }
  }],

  score: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("StudentTest", StudentTestSchema);
