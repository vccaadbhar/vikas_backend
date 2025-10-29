const mongoose = require("mongoose");

const FeeStructureSchema = new mongoose.Schema({
  className: { type: String, required: true },   // e.g. "10th Grade"
  feeType: { type: String, required: true },     // e.g. Tuition, Transport
  amount: { type: Number, required: true },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("FeeStructure", FeeStructureSchema);
