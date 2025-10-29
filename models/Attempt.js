const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        selectedIndex: { type: Number },  // which option student selected
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }, // seconds
      },
    ],

    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // total time taken in seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", AttemptSchema);
