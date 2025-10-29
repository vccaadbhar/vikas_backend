const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fatherName: String,
    motherName: String,
    dob: Date,
    aadhaarNumber: String,
    phone1: String,
    phone2: String,
    email: { type: String, required: true, unique: true },
    address: String,
    class: { type: String, required: true }, // ✅ match frontend
    section: String,
    subject: String,
    photo: { type: String, default: "" }, // URL/path of uploaded photo
    password: { type: String, required: true }, // you may hash before saving
    admissionDate: { type: Date, default: Date.now },
    feeStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fees: [
      {
        month: String,
        amount: Number,
        status: { type: String, enum: ["paid", "pending", "partial"] },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
