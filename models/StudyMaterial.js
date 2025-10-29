const mongoose = require("mongoose");

const StudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },  // store link to file (S3, Google Drive, or local path)
  subject: { type: String, required: true },
  chapter: { type: String },
  topic: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  access: {
    className: { type: String },  // e.g., "10A"
    batch: { type: String },      // optional finer control
  }
}, { timestamps: true });

module.exports = mongoose.model("StudyMaterial", StudyMaterialSchema);
