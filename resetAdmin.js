// resetAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = "admin@vikas.com";
    const plainPassword = "Admin@123";

    let admin = await User.findOne({ email });
    if (admin) {
      admin.password = plainPassword; // ⚠️ plain password, let pre("save") hash it
      admin.role = "superadmin";
      await admin.save();
      console.log(`🔄 Admin password reset for ${email} to: ${plainPassword}`);
    } else {
      admin = new User({
        name: "Super Admin",
        email,
        password: plainPassword, // ⚠️ plain password
        role: "superadmin",
      });
      await admin.save();
      console.log(`✅ Admin created with email: ${email} and password: ${plainPassword}`);
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

resetAdmin();
