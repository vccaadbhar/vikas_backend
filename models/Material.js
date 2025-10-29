const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String },
  type: { type: String, enum: ["pdf", "link", "video"], default: "pdf" },
  url: { type: String, required: true }, // file path or video link
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Material", MaterialSchema);
