const db = require('./db');
const createUsersTable = require('./user');
const { createRoleTable, insertPredefinedRoles } = require('./role');
const createOrganizationTable = require('./organization');
const createDeviceAreaTable = require('./device_area');
const createDeviceTable = require('./device');
const createSettingsTable = require('./settings');

// Function to initialize the database
const initializeDatabase = async () => {
    try {
        console.log('Creating roles table...');
        await createRoleTable();
        console.log('Inserting predefined roles...');
        await insertPredefinedRoles();
        console.log('Creating organization table...');
        await createOrganizationTable();
        console.log('Creating users table...');
        await createUsersTable();
        console.log('Creating device area table...');
        await createDeviceAreaTable();
        console.log('Creating device table...');
        await createDeviceTable();
        console.log('Creating settings table...');
        await createSettingsTable();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initializeDatabase();

module.exports = db;
