const { ipcMain } = require('electron');
const db = require('../models/db');

ipcMain.handle('get-settings', () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM settings WHERE id = 1", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('update-settings', (event, updatedSettings) => {
    const { hostname, api } = updatedSettings;
    
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE settings
            SET value = ?
            WHERE id = 1
        `, [api], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});