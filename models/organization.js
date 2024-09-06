const db = require('./db');

const createOrganizationTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS organization (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT NOT NULL,
                type TEXT,
                principal TEXT,
                address TEXT,
                email TEXT,
                phone TEXT,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating organization table:', err);
                reject(err);
            } else {
                console.log('Organization table created successfully.');
                resolve();
            }
        });
    });
}

module.exports = createOrganizationTable;
