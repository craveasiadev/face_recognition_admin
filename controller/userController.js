const { ipcMain } = require('electron');
const db = require("../models/db");

// Fetch all users from the database
ipcMain.handle('get-users-employee', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            where role_id = 1`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('get-users-visitor', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            where role_id = 2`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('get-users-blacklist', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            where role_id = 3`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

//Insert user data 
ipcMain.handle('insert-user', (event, data) => {
    const { name, email, phone, role, image, sn, card, id_card } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (name, email, phone, role_id, profile_image, user_sn, id_number, card_number)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, email, phone, role, image, sn, id_card, card], (err) => {
            if (err) {
                console.error('Error inserting device:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

//Update User data
ipcMain.handle('update-user', (event, updatedUser) => {
    const {  name, email, phone, role, image, sn, card, id_card, user_id } = updatedUser;
    
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE users
            SET name = ?, email = ?, phone = ?, role_id = ?, profile_image = ?, user_sn = ?, id_number = ?, card_number = ?
            WHERE id = ?
        `, [name, email, phone, role, image, sn, id_card, card, user_id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});