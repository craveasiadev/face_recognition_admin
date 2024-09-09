const { ipcMain } = require('electron');
const db = require("../models/db");
const fs = require('fs');
const path = require('path');


// Directory to save uploaded images
const imagesDir = path.join(__dirname, '..', 'uploads');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

ipcMain.handle('insert-user', (event, data) => {
    const { name, username, email, phone, role, image, sn, card, id_card } = data;

    // Generate a filename for the image
    const fileName = `${sn}_${Date.now()}.png`;
    const filePath = path.join(imagesDir, fileName);

    // Save base64 image data to a file
    if (image.startsWith('data:image/')) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        fs.writeFile(filePath, base64Data, { encoding: 'base64' }, (err) => {
            if (err) {
                console.error('Error saving image:', err);
            }
        });
    }

    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (name, username, email, phone, role_id, profile_image, user_sn, id_number, card_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, username, email, phone, role, fileName, sn, id_card, card], (err) => {
            if (err) {
                console.error('Error inserting user:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

//delete user
ipcMain.handle('delete-user', (event, userId) => {
    return new Promise((resolve, reject) => {
        // First, fetch the user's profile image from the database before deleting
        db.get(`
            SELECT profile_image FROM users WHERE id = ?
        `, [userId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            const profileImage = row ? row.profile_image : null;

            // Now delete the user from the database
            db.run(`
                DELETE FROM users WHERE id = ?
            `, userId, function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                // If the user had a profile image, attempt to delete it from the uploads folder
                if (profileImage) {
                    const imagePath = path.join(__dirname, '..', 'uploads', profileImage);
                    
                    // Check if the file exists before deleting it
                    fs.access(imagePath, fs.constants.F_OK, (err) => {
                        if (!err) {
                            // File exists, so delete it
                            fs.unlink(imagePath, (err) => {
                                if (err) {
                                    console.error('Error deleting image:', err);
                                    reject(err);
                                } else {
                                    console.log(`Profile image ${profileImage} deleted successfully`);
                                }
                            });
                        }
                    });
                }

                // Resolve the Promise after user deletion (and image if applicable)
                resolve({ success: true, changes: this.changes });
            });
        });
    });
});

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