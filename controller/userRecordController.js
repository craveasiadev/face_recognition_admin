const { ipcMain } = require('electron');
const db = require('../models/db');

ipcMain.handle('insert-user-record', (event, data) => {
    const { personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO user_record (personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [personName, cardNo, personSn, openDoorFlag, strangerFlag, role, createTime, checkImgUrl], (err) => {
            if (err) {
                console.error('error inserting device area: ', err)
            } else {
                resolve()
            }
        })
    })
})

ipcMain.handle('delete-user-record', (event, userRecordId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM user_record where id = ?
        `, userRecordId, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve({success : true, changes : this.changes})
            }
        })
    })
})

ipcMain.handle('get-user-record', () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user_record", (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
})

ipcMain.handle('remove-user-record-role-based', (event, role) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM user_record where role = ?
        `, role, function(err) {
            if (err) {
                reject(err)
            } else {
                resolve({success : true, changes : this.changes})
            }
        })
    })
})