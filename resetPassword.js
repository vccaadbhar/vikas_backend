const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "aman@student.com";   // target user
    const newPassword = "Test@123";     // reset password

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found");
    } else {
      console.log(`✅ Password for ${email} reset to: ${newPassword}`);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

resetPassword();
