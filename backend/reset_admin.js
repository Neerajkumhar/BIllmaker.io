const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://neerajkumhar2005:neeraj123@taskflow.zx2gw1k.mongodb.net/Visuark-billCenter?appName=taskflow';
    await mongoose.connect(MONGO_URI);
    
    const email = 'admin@visuark.com';
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('Admin user not found. Creating a new one...');
      const newUser = new User({
        name: 'Admin User',
        email: email.toLowerCase(),
        password: 'admin123',
        role: 'admin'
      });
      await newUser.save();
      console.log('New Admin User created!');
    } else {
      user.password = 'admin123';
      user.role = 'admin';
      await user.save();
      console.log('Admin password updated successfully!');
    }
    
    console.log('------------------------');
    console.log(`Email: ${email}`);
    console.log('Password: admin123');
    console.log('------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
