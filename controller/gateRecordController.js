const { ipcMain } = require('electron');
const db = require('../models/db');

ipcMain.handle('insert-gate-record', (event, data) => {
    const { personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl } = data;

    return new Promise((resolve, reject) => {
        // Check if the record already exists
        db.get(`
            SELECT * FROM gate_record
            WHERE personSn = ? AND createTime = ?
        `, [personSn, createTime], (err, row) => {
            if (err) {
                console.error('Error checking for existing record:', err);
                reject(err);
            } else if (row) {
                // Record already exists, so skip insertion
                console.log(`Record with personSn ${personSn} at ${createTime} already exists.`);
                resolve();
            } else {
                // Record does not exist, so insert it
                db.run(`
                    INSERT INTO gate_record (personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl], (err) => {
                    if (err) {
                        console.error('Error inserting user record:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
});


ipcMain.handle('get-gate-record-visitor', () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM gate_record where role = 2", (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
})

ipcMain.handle('get-gate-visitor-record-dashboard', (event) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT COUNT(*) as count, 
                   DATE(createTime / 1000, 'unixepoch') as date -- Convert createTime to a date format
            FROM gate_record
            WHERE role = 2 -- Visitors
            GROUP BY DATE(createTime / 1000, 'unixepoch') -- Group by the date portion of createTime
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});


ipcMain.handle('get-gate-employee-record-dashboard', (event) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT COUNT(*) as count, DATE(created_at) as date
            FROM gate_record
            WHERE role = 1 -- Employee
            GROUP BY DATE(created_at)
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});