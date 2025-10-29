const mongoose = require("mongoose");

const RecordedClassSchema = new mongoose.Schema({
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  topic: { type: String, required: true },
  videoUrl: { type: String, required: true }, // YouTube unlisted / private server URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("RecordedClass", RecordedClassSchema);
