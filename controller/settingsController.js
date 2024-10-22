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
    const { api } = updatedSettings;
    
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

ipcMain.handle('insert-sync-record-data', (event, data) => {
    const { type, details, status, status_details } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO sync_record (type, details, status, status_details)
            VALUES (?, ?, ?, ?)
        `, [type, details, status, status_details], (err) => {
            if (err) {
                console.error('Error inserting sync_record:', err);
                reject(err)
            } else {
                resolve();
            }
        });
    });
});

ipcMain.handle('delete-sync-record', (event, syncRecordId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM sync_record where id = ?
        `, syncRecordId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({success : true, changes : this.changes});
            }
        });
    });
});

ipcMain.handle('get-sync-record', () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM sync_record ORDER BY created_at DESC", (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
})

ipcMain.handle('remove-sync-data-10-days-ago', () => {
    return new Promise((resolve, reject) => {
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
        db.run(`DELETE FROM sync_record WHERE created_at < ?`, [tenDaysAgo], function(err) {
            if (err) {
                console.error('Error deleting old sync records: ', err)
                reject(err)
            } else {
                console.log(`${this.changes} old sync records deleted.`)
                resolve(this.changes)
            }
        })
    })
})

