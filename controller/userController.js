const { app, ipcMain } = require('electron');
const db = require("../models/db");
const fs = require('fs');
const path = require('path');


// Directory to save uploaded images
const imagesDir = path.join(app.getPath('userData'), '..', 'uploads');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

ipcMain.handle('insert-user', (event, data) => {
    console.log('Inserting user into database:', data);
    const { name, username, email, phone, role, image, sn, card } = data;

    // Generate a filename for the image
    let fileName;
    let filePath;
    if (image == "" ) {
        fileName = "no image";
        filePath = path.join(imagesDir, fileName);
    } else {
        fileName = `${sn}_${Date.now()}.png`;
        filePath = path.join(imagesDir, fileName);
    }
    
    // Save base64 image data to a file
    if (image) {
        let base64Data;
        if (image.startsWith('data:image/')) {
            // Log the fact that the image has a header
            console.log('Image has a base64 header.');
            base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        } else {
            // Log the fact that the image does not have a header
            console.log('Image is pure base64.');
            base64Data = image;
        }

        // Log the first 100 characters of the base64 data for debugging
        console.log('Base64 image data (first 100 characters):', base64Data.substring(0, 100));

        // Save the base64 image data to the file
        fs.writeFile(filePath, base64Data, { encoding: 'base64' }, (err) => {
            if (err) {
                console.error('Error saving image:', err);
            } else {
                console.log('Image saved successfully at:', filePath);
            }
        });
    }

    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (name, username, email, phone, role_id, profile_image, user_sn, card_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, username, email, phone, role, filePath, sn, card], (err) => {
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
                    const imagePath = path.join(app.getPath('userData'), '..', 'uploads', profileImage);
                    
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
    const {  name, email, phone, role, image, sn, card, user_id } = updatedUser;
    
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE users
            SET name = ?, email = ?, phone = ?, role_id = ?, profile_image = ?, user_sn = ?, card_number = ?
            WHERE id = ?
        `, [name, email, phone, role, image, sn, card, user_id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});

//Get all device by area
ipcMain.handle('get-device-by-area', (event, deviceId) => {
    console.log(`Fetching devices for area: ${deviceId}`); // Add this for logging the deviceId
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM device WHERE device_area_id = ?`, [deviceId], (err, rows) => {
            if (err) {
                console.error("Database error:", err); // Add this for logging errors
                reject(err);
            } else {
                console.log("Fetched devices:", rows); // Add this for logging fetched rows
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('get-all-devices', () => {
     // Add this for logging the deviceId
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

//Get User by ID
ipcMain.handle('get-user-by-id', (event, userId) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE users.id = ?
        `, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
});

//Find User by Card
ipcMain.handle('get-user-by-card', (event, card) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM users WHERE card_number = ?
        `, [card], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
});

ipcMain.handle('remove-users-role-based', (event, roleId) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM users WHERE role_id = ?
        `, roleId, function(err) {
            if (err) {
                reject(err)
            } else {
                resolve({success : true, changes : this.changes})
            }
        })
    })
})


//Count Total For Dashboard
ipcMain.handle('get-total-users-visitor', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE role_id = 2`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const totalUsers = rows.length; // Count total users (visitors)
                resolve({ users: rows, totalUsers: totalUsers });
            }
        });
    });
});


ipcMain.handle('get-total-users-employee', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE role_id = 1`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const totalUsers = rows.length; // Count total users (visitors)
                resolve({ users: rows, totalUsers: totalUsers });
            }
        });
    });
});

ipcMain.handle('get-total-users-blacklist', () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT users.*, roles.role_name
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE role_id = 3`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const totalUsers = rows.length; // Count total users (visitors)
                resolve({ users: rows, totalUsers: totalUsers });
            }
        });
    });
});

ipcMain.handle('get-total-devices', () => {
    // Add this for logging the deviceId
   return new Promise((resolve, reject) => {
       db.all(`SELECT * FROM device`, (err, rows) => {
           if (err) {
               console.error("Database error:", err); // Add this for logging errors
               reject(err);
           } else {
               const totalDevices = rows.length;
               resolve({ devices: rows, totalDevices: totalDevices });
           }
       });
   });
});

ipcMain.handle('get-users-employee-dashboard', (event) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT COUNT(*) as count, DATE(created_at) as date
            FROM users
            WHERE role_id = 1 -- Employees
            GROUP BY DATE(created_at)
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.handle('get-users-visitor-dashboard', (event) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT COUNT(*) as count, DATE(created_at) as date
            FROM users
            WHERE role_id = 2 -- Visitors
            GROUP BY DATE(created_at)
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});


ipcMain.handle('remove-old-users', (event) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM users 
            WHERE created_at < datetime('now', '-1 day')
        `, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
});