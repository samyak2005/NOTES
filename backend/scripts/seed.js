const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Tenant = require('../models/Tenant');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Tenant.deleteMany({});
    console.log('Cleared existing data');

    // Create tenants
    const acmeTenant = new Tenant({
      name: 'Acme Corporation',
      slug: 'acme',
      subscription: 'free',
      noteLimit: 3
    });

    const globexTenant = new Tenant({
      name: 'Globex Corporation',
      slug: 'globex',
      subscription: 'free',
      noteLimit: 3
    });

    await acmeTenant.save();
    await globexTenant.save();
    console.log('Created tenants');

    // Create users (password will be hashed by User model pre-save hook)
    const users = [
      {
        email: 'admin@acme.test',
        password: 'password',
        role: 'admin',
        tenant: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: 'member',
        tenant: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: 'admin',
        tenant: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: 'member',
        tenant: globexTenant._id
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log('Created test users');
    console.log('Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('admin@acme.test (Admin, Acme) - password: password');
    console.log('user@acme.test (Member, Acme) - password: password');
    console.log('admin@globex.test (Admin, Globex) - password: password');
    console.log('user@globex.test (Member, Globex) - password: password');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
