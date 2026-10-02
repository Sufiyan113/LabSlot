/**
 * SAMPLE SEED DATA STRUCTURE (Phase 2)
 * ------------------------------------
 * This file shows the shape of data that will be inserted by the real seed script
 * in a later phase. It is NOT executable yet — it is documentation + reference.
 *
 * Real seed script (seed.js) will:
 *  1. Connect to MongoDB
 *  2. Clear existing collections (optional, only in development)
 *  3. Create users with hashed passwords
 *  4. Create labs
 *  5. Create equipment linked to labs
 *  6. Create sample bookings and maintenance records
 *  7. Create sample notifications
 */

const sampleSeed = {
  // ============================================================
  // USERS (passwords will be hashed by the User model pre-save hook)
  // ============================================================
  users: [
    {
      name: 'System Admin',
      email: 'admin@labslot.edu',
      password: 'Admin@123', // will be hashed
      role: 'admin',
      department: 'Computer Science',
      phone: '+91-9876543210',
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul.assistant@labslot.edu',
      password: 'Assistant@123',
      role: 'assistant',
      department: 'Electronics',
      phone: '+91-9876543211',
    },
    {
      name: 'Priya Patel',
      email: 'priya.student@labslot.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'CS2021-042',
      department: 'Computer Science',
      phone: '+91-9876543212',
    },
    {
      name: 'Amit Kumar',
      email: 'amit.student@labslot.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'CS2021-057',
      department: 'Computer Science',
      phone: '+91-9876543213',
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.student@labslot.edu',
      password: 'Student@123',
      role: 'student',
      studentId: 'EC2022-019',
      department: 'Electronics',
      phone: '+91-9876543214',
    },
  ],

  // ============================================================
  // LABS
  // ============================================================
  labs: [
    {
      name: 'IoT Laboratory',
      code: 'IOT-LAB',
      building: 'Block A',
      floor: '2',
      roomNumber: 'A-201',
      department: 'Electronics',
      description: 'Internet of Things lab with microcontrollers, sensors, and wireless modules.',
      capacity: 40,
      status: 'active',
    },
    {
      name: 'Embedded Systems Lab',
      code: 'ES-LAB',
      building: 'Block A',
      floor: '2',
      roomNumber: 'A-205',
      department: 'Electronics',
      description: 'Embedded systems and microcontroller programming laboratory.',
      capacity: 35,
      status: 'active',
    },
    {
      name: 'Computer Networks Lab',
      code: 'CN-LAB',
      building: 'Block B',
      floor: '1',
      roomNumber: 'B-105',
      department: 'Computer Science',
      description: 'Networking equipment, routers, switches, and protocol analyzers.',
      capacity: 30,
      status: 'active',
    },
    {
      name: 'Programming Lab',
      code: 'PROG-LAB',
      building: 'Block C',
      floor: 'Ground',
      roomNumber: 'C-001',
      department: 'Computer Science',
      description: 'General purpose programming and software development laboratory.',
      capacity: 60,
      status: 'active',
    },
  ],

  // ============================================================
  // EQUIPMENT (equipmentId must be unique)
  // lab will be set to the ObjectId of the corresponding lab after creation
  // ============================================================
  equipment: [
    {
      name: 'ESP32 Development Kit',
      equipmentId: 'ESP32-IOT-001',
      category: 'Microcontroller',
      labCode: 'IOT-LAB', // temporary key used by seed script
      description: 'ESP32 Wi-Fi + Bluetooth dual-core development board.',
      manufacturer: 'Espressif',
      model: 'ESP32-WROOM-32',
      condition: 'excellent',
      status: 'available',
    },
    {
      name: 'ESP32 Development Kit',
      equipmentId: 'ESP32-IOT-004',
      category: 'Microcontroller',
      labCode: 'IOT-LAB',
      description: 'ESP32 Wi-Fi + Bluetooth dual-core development board.',
      manufacturer: 'Espressif',
      model: 'ESP32-WROOM-32',
      condition: 'good',
      status: 'available',
    },
    {
      name: 'Arduino UNO R3',
      equipmentId: 'ARD-UNO-012',
      category: 'Development Board',
      labCode: 'ES-LAB',
      description: 'Arduino UNO R3 microcontroller board based on ATmega328P.',
      manufacturer: 'Arduino',
      model: 'UNO R3',
      condition: 'good',
      status: 'available',
    },
    {
      name: 'Raspberry Pi 4 Model B',
      equipmentId: 'RPI4-008',
      category: 'Computing',
      labCode: 'IOT-LAB',
      description: 'Raspberry Pi 4 Model B 4GB RAM single-board computer.',
      manufacturer: 'Raspberry Pi Foundation',
      model: '4 Model B',
      condition: 'excellent',
      status: 'available',
    },
    {
      name: 'HC-SR04 Ultrasonic Sensor',
      equipmentId: 'SNS-HCSR04-003',
      category: 'Sensor',
      labCode: 'IOT-LAB',
      description: 'Ultrasonic distance measuring sensor module.',
      manufacturer: 'Generic',
      model: 'HC-SR04',
      condition: 'good',
      status: 'available',
    },
    {
      name: 'Digital Multimeter',
      equipmentId: 'DMM-FLK-007',
      category: 'Measuring Instrument',
      labCode: 'ES-LAB',
      description: 'Fluke digital multimeter for voltage, current, and resistance.',
      manufacturer: 'Fluke',
      model: '115',
      condition: 'excellent',
      status: 'available',
    },
    {
      name: 'Digital Oscilloscope',
      equipmentId: 'OSC-RIG-002',
      category: 'Measuring Instrument',
      labCode: 'ES-LAB',
      description: '100 MHz dual-channel digital storage oscilloscope.',
      manufacturer: 'Rigol',
      model: 'DS1102Z-E',
      condition: 'good',
      status: 'available',
    },
    {
      name: 'Creality Ender 3 3D Printer',
      equipmentId: '3DP-END-001',
      category: '3D Printing',
      labCode: 'PROG-LAB',
      description: 'FDM 3D printer for prototyping and project work.',
      manufacturer: 'Creality',
      model: 'Ender 3',
      condition: 'good',
      status: 'available',
    },
    {
      name: 'NodeMCU ESP8266',
      equipmentId: 'NODE-ESP-015',
      category: 'Microcontroller',
      labCode: 'IOT-LAB',
      description: 'NodeMCU ESP8266 Wi-Fi development board.',
      manufacturer: 'Amica',
      model: 'NodeMCU v1.0',
      condition: 'fair',
      status: 'available',
    },
  ],

  // ============================================================
  // SAMPLE BOOKINGS (will be created after users & equipment exist)
  // ============================================================
  // Structure only — actual ObjectIds filled by seed script
  bookings: [
    {
      // student: Priya
      // equipment: ESP32-IOT-004
      // date: tomorrow, 10:00–12:00
      purpose: 'IoT project – sensor data logging',
      status: 'pending',
    },
    {
      // student: Amit
      // equipment: ARD-UNO-012
      // date: tomorrow, 14:00–16:00
      purpose: 'Embedded systems lab experiment',
      status: 'approved',
    },
  ],

  // ============================================================
  // SAMPLE MAINTENANCE
  // ============================================================
  maintenances: [
    {
      // equipment: OSC-RIG-002
      issue: 'Channel 2 probe not detecting signal',
      description: 'Students reported intermittent readings on channel 2.',
      priority: 'high',
      status: 'reported',
    },
  ],
};

module.exports = sampleSeed;
