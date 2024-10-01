const db = require("./db");

const createSettingsTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_hostname TEXT NOT NULL,
                api_url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating settings table:', err);
                reject(err);
            } else {
                console.log('Settings table created successfully.');

                // Check if there's already a row in the table
                db.get(`SELECT COUNT(*) AS count FROM settings`, (err, row) => {
                    if (err) {
                        console.error('Error checking settings table:', err);
                        reject(err);
                    } else if (row.count === 0) {
                        // Insert dummy data if the table is empty
                        db.run(`
                            INSERT INTO settings (server_hostname, api_url)
                            VALUES (?, ?)
                        `, ['localhost', 'https://api.example.com/getUsers'], (err) => {
                            if (err) {
                                console.error('Error inserting dummy data into settings:', err);
                                reject(err);
                            } else {
                                console.log('Dummy data inserted into settings table.');
                                resolve();
                            }
                        });
                    } else {
                        console.log('Settings table already has data. No need to insert dummy data.');
                        resolve();
                    }
                });
            }
        });
    });
};


module.exports = createSettingsTable