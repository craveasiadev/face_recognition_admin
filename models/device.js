const db = require("./db");

const createDeviceTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS device (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_ip TEXT NOT NULL,
                device_key TEXT NOT NULL,
                device_name TEXT NOT NULL,
                device_area_id INTEGER,
                communication_password TEXT,
                device_entry TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (device_area_id) REFERENCES device_area(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating device table:', err);
                reject(err);
            } else {
                console.log('Device table created successfully.');
                resolve();
            }
        });
    });
}

module.exports = createDeviceTable