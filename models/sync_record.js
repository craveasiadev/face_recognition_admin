const db = require("./db");

const createSyncRecordTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS sync_record (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                details TEXT NOT NULL,
                status TEXT NOT NULL,
                status_details INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating sync_record table:', err);
                reject(err);
            } else {
                console.log('sync_record table created successfully.');
                resolve();
            }
        });
    });
}

module.exports = createSyncRecordTable