const mongoose = require("mongoose");

const FeePaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  feeType: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  paidDate: { type: Date, default: Date.now },
  month: { type: String },
  receiptNo: { type: String, unique: true }, // ✅ new
  status: { type: String, enum: ["paid", "partial", "pending"], default: "paid" },
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("FeePayment", FeePaymentSchema);

