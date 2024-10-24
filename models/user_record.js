const db = require('./db');

const createUserRecordTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS user_record (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                personName TEXT,
                cardNo TEXT,
                personSn TEXT,
                openDoorFlag TEXT,
                strangerFlag TEXT,
                role TEXT,
                createTime TEXT,
                checkImgUrl TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                reject(err);
            } else {
                console.log('Users table created successfully.');
                resolve();
            }
        });
    });
};


module.exports = createUserRecordTable;
