const mongoose = require("mongoose");

const TeacherPaymentSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },  // e.g. "Oct 2025"
  status: { type: String, enum: ["paid", "pending"], default: "pending" },
  paidDate: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("TeacherPayment", TeacherPaymentSchema);
