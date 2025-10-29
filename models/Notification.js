const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String },
    type: { type: String, enum: ["text", "image", "video", "file", "link"], default: "text" },
    fileUrl: { type: String },   // for uploads
    link: { type: String },      // for YouTube/Zoom/Meet
    audience: { 
      type: String, 
      enum: ["student", "parent", "staff", "teacher", "all"], 
      default: "all" 
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // single student
    className: { type: String },   // e.g. "10"
    section: { type: String },     // e.g. "A"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
