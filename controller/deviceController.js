// controllers/DeviceController.js
const { ipcMain } = require('electron');
const db = require('../models/db');

// Insert a new device area
ipcMain.handle('insert-device-area', (event, data) => {
    const { areaName, sort } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO device_area (area_name, sort)
            VALUES (?, ?)
        `, [areaName, sort], (err) => {
            if (err) {
                console.error('Error inserting device area:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

// Fetch all device areas
ipcMain.handle('get-device-areas', () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM device_area", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('delete-device-area', (event, deviceAreaId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM device_area where id = ?
        `, deviceAreaId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({success : true, changes : this.changes});
            }
        });
    });
});
//Device
ipcMain.handle('insert-device', (event, data) => {
    const { device_ip, device_key, device_name, device_area, password, device_entry } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO device (device_ip, device_key, device_name, device_area_id, communication_password, device_entry)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [device_ip, device_key, device_name, device_area, password, device_entry], (err) => {
            if (err) {
                console.error('Error inserting device:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

ipcMain.handle('get-device', () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT device.*, device_area.area_name
            FROM device
            JOIN device_area ON device.device_area_id = device_area.id
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('get-device-by-id', (event, deviceId) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT device.*, device_area.area_name
            FROM device
            JOIN device_area ON device.device_area_id = device_area.id
            WHERE device.id = ?
        `, [deviceId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
});


ipcMain.handle('delete-device', (event, deviceId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM device where id = ?
        `, deviceId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({success : true, changes : this.changes});
            }
        });
    });
});



ipcMain.handle('update-device', (event, updatedDevice) => {
    const { device_id, device_ip, device_key, device_name, device_area, device_entry } = updatedDevice;
    
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE device
            SET device_key = ?, device_name = ?, device_ip = ?, device_entry = ?, device_area_id = ?
            WHERE id = ?
        `, [device_key, device_name, device_ip, device_entry, device_area, device_id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});

ipcMain.handle('update-device-pass', (event, updatedPass) => {
    const { deviceId, newPass } = updatedPass;
    
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE device
            SET communication_password = ?
            WHERE id = ?
        `, [newPass, deviceId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});
