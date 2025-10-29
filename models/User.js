const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Base schema
const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "superadmin", "staff"],
      required: true,
    },

    // Common fields
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    aadhaarNumber: { type: String },
    phone: [{ type: String }], // multiple numbers
    email: { type: String, required: true, unique: true },
    address: { type: String },
    photo: { type: String }, // file path stored here
    password: { type: String, required: true },

    // Student-specific fields
    fatherName: String,
    motherName: String,
    className: String,
    section: String,
    subjects: [String],

    // Parent-specific fields
    childName: String,
    childDob: Date,
     // link to student
    child: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User", // student is also User with role 'student'
      default: null,
},
    // Teacher-specific fields
    qualification: String,
    graduationSubject: String,
    graduationYear: String,
    postGraduationSubject: String,
    postGraduationYear: String,
    specialCourse: String,

    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
      branchName: String,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
