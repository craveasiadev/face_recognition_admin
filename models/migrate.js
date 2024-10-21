
const createUsersTable = require('./user');
const { createRoleTable, insertPredefinedRoles } = require('./role');
const createOrganizationTable = require('./organization');
const createDeviceAreaTable = require('./device_area');
const createDeviceTable = require('./device');
const {createSettingsTable, insertPredefinedSettings} = require('./settings');

// Function to initialize the database
const initializeDatabase =  () => {
    try {
        console.log('Creating roles table...');
         createRoleTable();
        console.log('Creating organization table...');
         createOrganizationTable();
        console.log('Creating users table...');
         createUsersTable();
        console.log('Creating device area table...');
         createDeviceAreaTable();
        console.log('Creating device table...');
         createDeviceTable();
        console.log('Creating settings table...');
         createSettingsTable();
        console.log('Inserting rolse data...');
         insertPredefinedRoles();
        console.log('Inserting settings data...');
         insertPredefinedSettings();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initializeDatabase();

module.exports = initializeDatabase; // Export the function
