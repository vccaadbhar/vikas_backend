const mongoose = require("mongoose");

const TeacherStructureSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  salaryType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
  amount: { type: Number, required: true },
  month: { type: String } // e.g. "Jan", "Feb"
}, { timestamps: true });

module.exports = mongoose.model("TeacherStructure", TeacherStructureSchema);
