const db = require('./db');

const createDeviceAreaTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS device_area (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                area_name TEXT NOT NULL,
                sort INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating device area table:', err);
                reject(err);
            } else {
                console.log('Device Area table created successfully.');
                resolve();
            }
        });
    });
};

module.exports = createDeviceAreaTable;
