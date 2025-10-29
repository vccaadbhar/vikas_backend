const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv").config();

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = "aman@student.com";
  const plainPassword = "Test@123";
  const hashed = await bcrypt.hash(plainPassword, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { password: hashed },
    { new: true }
  );

  console.log("✅ Password reset successful:", user.email, "->", plainPassword);
  process.exit();
}

reset();
