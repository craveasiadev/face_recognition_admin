const db = require('./db');

const createRoleTable = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating roles table:', err);
                    reject(err);
                } else {
                    console.log('Roles table created successfully.');
                    resolve();
                }
            });
        });
    });
};

const insertPredefinedRoles = () => {
    return new Promise((resolve, reject) => {
        const roles = ['internal staff', 'visitor', 'blacklist'];
        const insertRole = db.prepare(`INSERT INTO roles (role_name) VALUES (?)`);

        roles.forEach((role, index, array) => {
            insertRole.run(role, (err) => {
                if (err) {
                    console.error(`Error inserting role '${role}':`, err);
                    reject(err);
                } else {
                    console.log(`Role '${role}' inserted successfully.`);
                    if (index === array.length - 1) {
                        insertRole.finalize((finalizeErr) => {
                            if (finalizeErr) {
                                reject(finalizeErr);
                            } else {
                                resolve();
                            }
                        });
                    }
                }
            });
        });
    });
};

module.exports = { createRoleTable, insertPredefinedRoles };
