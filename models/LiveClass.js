const mongoose = require("mongoose");

const LiveClassSchema = new mongoose.Schema({
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  topic: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String, required: true }, // Zoom/Jitsi/Google Meet link
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("LiveClass", LiveClassSchema);
