/**
 * Development seed script
 * Usage: node scripts/seed.js
 * Creates admin, assistant, sample labs and equipment.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, Lab, Equipment } = require('../models');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Users
    const users = [
      { name: 'System Admin', email: 'admin@labslot.edu', password: 'Admin@123', role: 'admin', department: 'Computer Science' },
      { name: 'Rahul Sharma', email: 'rahul.assistant@labslot.edu', password: 'Assistant@123', role: 'assistant', department: 'Electronics' },
      { name: 'Priya Patel', email: 'priya.student@labslot.edu', password: 'Student@123', role: 'student', studentId: 'CS2021-042', department: 'Computer Science' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`User exists: ${u.email}`);
      }
    }

    // Labs
    const labsData = [
      { name: 'IoT Laboratory', code: 'IOT-LAB', building: 'Block A', floor: '2', roomNumber: 'A-201', department: 'Electronics', description: 'IoT lab with microcontrollers and sensors.', capacity: 40 },
      { name: 'Embedded Systems Lab', code: 'ES-LAB', building: 'Block A', floor: '2', roomNumber: 'A-205', department: 'Electronics', description: 'Embedded systems laboratory.', capacity: 35 },
      { name: 'Computer Networks Lab', code: 'CN-LAB', building: 'Block B', floor: '1', roomNumber: 'B-105', department: 'Computer Science', description: 'Networking equipment lab.', capacity: 30 },
      { name: 'Programming Lab', code: 'PROG-LAB', building: 'Block C', floor: 'Ground', roomNumber: 'C-001', department: 'Computer Science', description: 'General programming lab.', capacity: 60 },
    ];

    const labMap = {};
    for (const l of labsData) {
      let lab = await Lab.findOne({ code: l.code });
      if (!lab) {
        lab = await Lab.create(l);
        console.log(`Created lab: ${l.code}`);
      } else {
        console.log(`Lab exists: ${l.code}`);
      }
      labMap[l.code] = lab._id;
    }

    // Equipment
    const eqData = [
      { name: 'ESP32 Development Kit', equipmentId: 'ESP32-IOT-001', category: 'Microcontroller', labCode: 'IOT-LAB', manufacturer: 'Espressif', model: 'ESP32-WROOM-32', condition: 'excellent' },
      { name: 'ESP32 Development Kit', equipmentId: 'ESP32-IOT-004', category: 'Microcontroller', labCode: 'IOT-LAB', manufacturer: 'Espressif', model: 'ESP32-WROOM-32', condition: 'good' },
      { name: 'Arduino UNO R3', equipmentId: 'ARD-UNO-012', category: 'Development Board', labCode: 'ES-LAB', manufacturer: 'Arduino', model: 'UNO R3', condition: 'good' },
      { name: 'Raspberry Pi 4 Model B', equipmentId: 'RPI4-008', category: 'Computing', labCode: 'IOT-LAB', manufacturer: 'Raspberry Pi Foundation', model: '4 Model B', condition: 'excellent' },
      { name: 'HC-SR04 Ultrasonic Sensor', equipmentId: 'SNS-HCSR04-003', category: 'Sensor', labCode: 'IOT-LAB', manufacturer: 'Generic', model: 'HC-SR04', condition: 'good' },
      { name: 'Digital Multimeter', equipmentId: 'DMM-FLK-007', category: 'Measuring Instrument', labCode: 'ES-LAB', manufacturer: 'Fluke', model: '115', condition: 'excellent' },
      { name: 'Digital Oscilloscope', equipmentId: 'OSC-RIG-002', category: 'Measuring Instrument', labCode: 'ES-LAB', manufacturer: 'Rigol', model: 'DS1102Z-E', condition: 'good' },
      { name: 'Creality Ender 3 3D Printer', equipmentId: '3DP-END-001', category: '3D Printing', labCode: 'PROG-LAB', manufacturer: 'Creality', model: 'Ender 3', condition: 'good' },
      { name: 'NodeMCU ESP8266', equipmentId: 'NODE-ESP-015', category: 'Microcontroller', labCode: 'IOT-LAB', manufacturer: 'Amica', model: 'NodeMCU v1.0', condition: 'fair' },
    ];

    for (const e of eqData) {
      const exists = await Equipment.findOne({ equipmentId: e.equipmentId });
      if (!exists) {
        await Equipment.create({
          name: e.name,
          equipmentId: e.equipmentId,
          category: e.category,
          lab: labMap[e.labCode],
          manufacturer: e.manufacturer,
          model: e.model,
          condition: e.condition,
          status: 'available',
          description: `${e.name} for laboratory use.`,
        });
        console.log(`Created equipment: ${e.equipmentId}`);
      } else {
        console.log(`Equipment exists: ${e.equipmentId}`);
      }
    }

    console.log('\nSeed completed successfully.');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
