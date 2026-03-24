const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Client = require('./models/Client');
const Service = require('./models/Service');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Client.deleteMany();
    await Service.deleteMany();

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@billmaker.io',
      password: 'admin123'
    });

    const clients = await Client.insertMany([
      { name: 'John Doe', companyName: 'Doe Corp', email: 'john@doecorp.com', phone: '123-456-7890', address: '123 Main St, Tech City', gstNumber: 'GST12345678' },
      { name: 'Jane Smith', companyName: 'Smith Solutions', email: 'jane@smithsol.com', phone: '098-765-4321', address: '456 Innovation Blvd, Tech City', gstNumber: 'GST87654321' }
    ]);

    const services = await Service.insertMany([
      { name: 'Graphic Design', description: 'Logo design, branding, and marketing materials.', basePrice: 5000 },
      { name: 'Video Editing', description: 'Professional video editing for YouTube and social media.', basePrice: 8000 },
      { name: 'Web Development', description: 'Custom website development using React and Node.js.', basePrice: 45000 },
      { name: 'UI/UX Design', description: 'User interface and user experience design for web and mobile apps.', basePrice: 25000 }
    ]);

    console.log('Database seeded successfully!');
    console.log(`Admin Email: admin@billmaker.io`);
    console.log(`Admin Password: admin123`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
