const { ipcMain } = require('electron');
const db = require("../models/db");

// Fetch all users from the database
ipcMain.handle('get-users', () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});