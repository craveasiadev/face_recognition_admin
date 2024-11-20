const db = require('./db');

const createGateRecordTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS gate_record (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                personName TEXT,
                cardNo TEXT,
                personSn TEXT,
                openDoorFlag TEXT,
                strangerFlag TEXT,
                role TEXT,
                createTime TEXT,
                checkImgUrl TEXT,
                device_name TEXT,
                device_area TEXT,
                device_ip TEXT,
                device_entry TEXT,
                device_store TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating gate record table:', err);
                reject(err);
            } else {
                console.log('Gate record table created successfully.');
                resolve();
            }
        });
    });
};


module.exports = createGateRecordTable;
