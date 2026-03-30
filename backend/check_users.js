const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://neerajkumhar2005:neeraj123@taskflow.zx2gw1k.mongodb.net/Visuark-billCenter?appName=taskflow' || process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, 'name email');
    console.log('--- Registered Users ---');
    users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}`));
    console.log('------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
};

listUsers();
