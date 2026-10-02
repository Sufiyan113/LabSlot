/**
 * Central export for all Mongoose models.
 * Import from here in controllers and services:
 *   const { User, Lab, Equipment, Booking, Maintenance, Notification } = require('../models');
 */
module.exports = {
  User: require('./User'),
  Lab: require('./Lab'),
  Equipment: require('./Equipment'),
  Booking: require('./Booking'),
  Maintenance: require('./Maintenance'),
  Notification: require('./Notification'),
};
