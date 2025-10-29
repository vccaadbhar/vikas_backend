require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@vikas.com' });
  if (!exists) {
    const a = new User({ name: 'Super Admin', email: 'admin@vikas.com', password: 'Admin@123', role: 'superadmin' });
    await a.save();
    console.log('Created Super Admin: admin@vikas.com / Admin@123');
  } else {
    console.log('Super Admin already exists');
  }
  process.exit(0);
}
run();
