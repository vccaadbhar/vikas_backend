const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },   // e.g. "10th Grade"
  section: { type: String },                // e.g. "A"
  subject: { type: String, required: true }, // e.g. "Math"
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  title: { type: String, required: true },
    type: { type: String, enum: ["recorded", "online"], required: true }, // 🎥 or 🖥
    subject: String,
    date: Date, // only for online classes
    link: { type: String, required: true }, // YouTube, Zoom, Webex, etc.
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" } // uploaded by teacher
}, { timestamps: true });

module.exports = mongoose.model("Class", ClassSchema);
