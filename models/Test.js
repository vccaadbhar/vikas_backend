const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },     // e.g. "Math Mock Test 1"
  subject: { type: String },
  duration: { type: Number, required: true },  // in minutes
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

  settings: {
    negativeMarking: { type: Boolean, default: false },
    marksPerQuestion: { type: Number, default: 1 },
    showResultInstantly: { type: Boolean, default: true }
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Test", TestSchema);
