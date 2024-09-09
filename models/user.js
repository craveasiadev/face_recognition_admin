const db = require('./db');

const createUserTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                role_id INTEGER,
                profile_image TEXT,
                user_sn TEXT UNIQUE,
                id_number INTEGER UNIQUE,
                card_number INTEGER UNIQUE,
                face_number INTEGER,
                order_number TEXT,
                time_begin TIMESTAMP,
                time_end TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                organization_id INTEGER,
                FOREIGN KEY (organization_id) REFERENCES organizations(id),
                FOREIGN KEY (role_id) REFERENCES roles(id)
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


module.exports = createUserTable;
