/**
 * One-time helper script to create an Admin (or Assistant) account.
 * Usage (from backend folder):
 *   node scripts/createAdmin.js
 *
 * Edit the values below before running, or pass via environment.
 * This script is for development only.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');

const ADMIN = {
  name: process.env.SEED_ADMIN_NAME || 'System Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@labslot.edu',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
  department: 'Computer Science',
  phone: '+91-9876543210',
};

const ASSISTANT = {
  name: process.env.SEED_ASSISTANT_NAME || 'Rahul Sharma',
  email: process.env.SEED_ASSISTANT_EMAIL || 'rahul.assistant@labslot.edu',
  password: process.env.SEED_ASSISTANT_PASSWORD || 'Assistant@123',
  role: 'assistant',
  department: 'Electronics',
  phone: '+91-9876543211',
};

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const data of [ADMIN, ASSISTANT]) {
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        console.log(`User already exists: ${data.email} (${existing.role})`);
        continue;
      }

      const user = await User.create(data);
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('\nDone. You can now log in with the credentials above.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createUsers();
