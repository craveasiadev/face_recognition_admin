const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('../models/db');
const fs = require('fs');

const imagesDir = path.join(app.getPath('userData'), '..', 'uploads');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

require("./userController");
require("./deviceController");
require("./settingsController");
require("./userRecordController");
require("./gateRecordController");
const initializeDatabase = require('../models/migrate'); 

// Flag to track if the database has been initialized
let isDatabaseInitialized = false;

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            nodeIntegration: true,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'view', 'dashboard.html')); 
}

async function getAutoSyncVal() {
    return await new Promise((resolve, reject) => {
        db.get("SELECT * FROM settings WHERE id = 2", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // Check if rows is null or undefined
                resolve(rows || null); // Return null if no rows found
            }
        });
    });
}

async function insertUser(user) {
    let fileName;
    let filePath;
    if (user.image == "" ) {
        fileName = "no image";
        filePath = path.join(imagesDir, fileName);
    } else {
        fileName = `${user.sn}_${Date.now()}.png`;
        filePath = path.join(imagesDir, fileName);
    }
    
    // Save base64 image data to a file
    if (user.image) {
        let base64Data;
        if (user.image.startsWith('data:image/')) {
            // Log the fact that the image has a header
            console.log('Image has a base64 header.');
            base64Data = user.image.replace(/^data:image\/\w+;base64,/, '');
        } else {
            // Log the fact that the image does not have a header
            console.log('Image is pure base64.');
            base64Data = user.image;
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

    await new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (name, username, email, phone, role_id, profile_image, user_sn, card_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [user.name, user.username, user.email, user.phone, user.role, fileName, user.sn, user.card], (err) => {
            if (err) {
                console.error('Error inserting user:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function insertSyncData(sync) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO sync_record (type, details, status, status_details)
            VALUES (?, ?, ?, ?)
        `, [sync.type, sync.details, sync.status, sync.status_details], (err) => {
            if (err) {
                console.error('Error inserting sync_record:', err);
                reject(err)
            } else {
                resolve();
            }
        });
    });
}

async function autoSyncData() {
    const settings = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM settings WHERE id = 1", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });

    async function loginAndGetToken(email, password) {
        try {
            const response = await fetch(`${settings.value}/auth/login?email=${email}&password=${password}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
    
            if (response.ok && result.status === 201) {
               
                const token = result.data.token.split('|')[1];
                return token;
            } else {
                console.error('Login failed:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Error during login:', error);
            return null;
        }
    }
    try {
        
        let allUser = [];
        let indexCount = 1;
        let hasData = true;
        
        await new Promise((resolve, reject) => {
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
        await new Promise((resolve, reject) => {
            db.run(`
                DELETE FROM users WHERE role_id = ?
            `, 2, function(err) {
                if (err) {
                    reject(err)
                } else {
                    resolve({success : true, changes : this.changes})
                }
            })
        })
        // Function to fetch data from a single device
        async function fetchDataFromDevice(device, payload) {
            const url = `http://${device.device_ip}:8090/cgi-bin/js/person/findList`;
        
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + device.communication_password)
                    },
                    body: JSON.stringify(payload)
                });
        
                const result = await response.json();
                return result.data;
            } catch (error) {
                console.error(`Error fetching data from ${device.device_ip}:`, error);
                return null;
            }
        }
        
        // Function to fetch image data using the user SN
        async function fetchImageFromDevice(device_ip, userSn, com_pass) {
            const url = `http://${device_ip}:8090/cgi-bin/js/face/find`;
        
            const payload = {
                personSn: userSn
            };
        
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + com_pass)
                    },
                    body: JSON.stringify(payload)
                });
        
                const result = await response.json();
                if (result && result.data) {
                    // Return the base64 image or empty string if no image found
                    return result.data.imgBase64 || "";
                }
            } catch (error) {
                console.error(`Error fetching image for userSn ${userSn} from ${device_ip}:`, error);
                return "";
            }
            return "";
        }
        
        while (hasData) {
            // console.log(indexCount);
        
            const payload = {
                index: indexCount,
                length: 10
            };
        
            const alldevices = await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM device`, (err, rows) => {
                    if (err) {
                        console.error("Database error:", err); // Add this for logging errors
                        reject(err);
                    } else {
                        console.log("Fetched devices:", rows); // Add this for logging fetched rows
                        resolve(rows);
                    }
                });
            });
        
            // Flag to track if any device has more data
            let dataFound = false;
        
            // Use for...of to handle asynchronous fetching properly
            for (const device of alldevices) {
                const data = await fetchDataFromDevice(device, payload);
        
                if (data && data.length > 0) {
                    // console.log(data.length);
                    // For each user, fetch their image
                    for (const user of data) {
                        // console.log(user.sn)
                        const imgBase64 = await fetchImageFromDevice(device.device_ip, user.sn, device.communication_password);
                        // Add the user and the image to the allUser array
                        allUser.push({
                            ...user, // Include the rest of the user data
                            imgBase64 // Add the image
                        });
                    }
        
                    dataFound = true; // Set flag to true if data is found
                }
            }
        
            // If no device returned any data, stop the loop
            if (!dataFound) {
                hasData = false;
            } else {
                indexCount++; // Increment the index to fetch the next set of data
            }
        }
        
        // Function to check and insert user data into the database
        async function checkAndInsertUser(record) {
            try {
                // Check if the user.type is 2 before proceeding
                if (record.type === 2) {
                    console.log("this user type is 2 !")
                    console.log(record.cardNo)
                    // Check if the user with the same cardNo exists
                    const existingUser = await new Promise((resolve, reject) => {
                        db.get(`
                            SELECT * FROM users WHERE card_number = ?
                        `, [record.cardNo], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                    console.log(existingUser)
                    if (!existingUser) {
                        // If no existing user, insert the new user with image
                        await insertUser({
                            name: record.name,
                            username: "",
                            email: "",  
                            phone: "",    
                            role: 2,
                            image: record.imgBase64 || "",
                            sn: record.sn,
                            card: record.cardNo
                        });
                        
                        console.log(`Inserted user: ${record.name}`);
                        // await window.api.insertSyncRecordData("fetch users", "get all visitor from device", "success", `success insert ${record.name}`)
                    } else {
                        console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                        await insertSyncData({
                            type: "fetch users",
                            details: "get all visitor from device",
                            status: "success", 
                            status_details: `${record.name} already exists in the database`
                        })

                    }
                } else {
                    console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                }
            } catch (error) {
                console.error('Error during user insertion:', error);
                await insertSyncData({
                    type: "fetch users", 
                    details: "get all visitor from device", 
                    status: "failed", 
                    status_details: `failed to insert ${record.name}`
                })
                
            }
        }

        async function checkAndInsertUserEmployee(record) {
            try {
                // Check if the user.type is 2 before proceeding
                if (record.type === 1) {
                    console.log("this user type is 1 !")
                    // Check if the user with the same cardNo exists
                    const existingUser = await new Promise((resolve, reject) => {
                        db.get(`
                            SELECT * FROM users WHERE card_number = ?
                        `, [record.cardNo], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                    console.log(record.imgBase64)
                    if (!existingUser) {
                        // If no existing user, insert the new user with image
                        console.log("user not exists with this card number")
                        await insertUser({
                            name: record.name,
                            username: "",
                            email: "",   
                            phone: "",    
                            role: 1,
                            image: record.imgBase64 || "",
                            sn: record.sn,
                            card: record.cardNo
                        });
                        console.log(`Inserted user: ${record.name}`);
                        // await window.api.insertSyncRecordData("fetch users", "get all employee from device", "success", `success insert ${record.name}`)
                    } else {
                        console.log(`User with card number ${record.cardNo} already exists, skipping insertion.`);
                        await insertSyncData({
                            type: "fetch users",
                            details: "get all visitor from device",
                            status: "success", 
                            status_details: `${record.name} already exists in the database`
                        })
                    }
                } else {
                    console.log(`User ${record.name} has type ${record.type}, skipping insertion.`);
                }
            } catch (error) {
                console.error('Error during user insertion:', error);
                await insertSyncData({
                    type: "fetch users", 
                    details: "get all visitor from device", 
                    status: "failed", 
                    status_details: `failed to insert ${record.name}`
                })
            }
        }
        
        //Once data is fetched, insert into the database
        allUser.forEach(async (record) => {
            await checkAndInsertUser(record);
            await checkAndInsertUserEmployee(record);
        });

        //Sync data to laravel API side
        const token = await loginAndGetToken('shasweendran@craveasia.com', '12345678');
        if (!token) {
            console.error('Failed to retrieve token.');
            return;
        }

        
        const users =  await new Promise((resolve, reject) => {
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

        const userData = users.map(user => {
            
            const [namePart, orderIdPart] = user.name.split(' '); // Split by space
        
            return {
                role_id: user.role_id,
                name: namePart,         
                order_detail_id: orderIdPart,  
                timestamp: user.card_number,
                status: 0,
                card_number: user.card_number
            };
        });

        const apiResponse = await fetch(`${settings.value}/user-registration-store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  
            },
            body: JSON.stringify({ users: userData })  
        });

        let apiResult;

        try {
            // Attempt to parse the JSON response
            apiResult = await apiResponse.json();
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return;
        }
        
        // Check if the response was successful (status 2xx)
        if (apiResponse.ok) {
            console.log('Sync successful', apiResult);
            for (const user of apiResult.successfulRegistrations) {
               
                await insertSyncData({
                    type: "sync users", 
                    details: "sync all visitors from database into server via API", 
                    status: "success", 
                    status_details: `Success to sync ${user.name} with order detailID ${user.order_detail_id}`
                })
               
            }
        } else {
            // If not successful (status not in 2xx), display the error message
            console.error('Sync failed:', apiResult);
            let apiErrorMsg = JSON.stringify(apiResult.message || 'Unknown error', null, 2);
            await insertSyncData({
                type: "sync users", 
                details: "sync all visitors from database into server via API", 
                status: "failed", 
                status_details: `failed to sync ${users.name} with order detailID ${userData.order_detail_id} due to ${apiErrorMsg}`
            })
        }

    } catch (error) {
        console.error('Error syncing data:', error);
    }
}

async function initializeApp() {
    // Only initialize the database if it hasn't been initialized yet
    if (!isDatabaseInitialized) {
        try {
            console.log("Initializing database...");
            await initializeDatabase(); // Ensure the DB is initialized
            isDatabaseInitialized = true; // Set flag to true after successful initialization
            console.log("Database initialized successfully.");
        } catch (err) {
            console.error('Failed to initialize database:', err);
        }
    }
    createMainWindow();

    let autoSync = await getAutoSyncVal();
    console.log("autosync value is " + autoSync.value);
    if (autoSync.value != "off") {
        setInterval(autoSyncData, 3 * 60 * 1000);
    } 
}

ipcMain.handle('restartApp', () => {
    app.relaunch();  // Relaunch the app
    app.quit();     // Exit the app
});

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        initializeApp(); // Ensure the app is initialized again if no windows are open
    }
});
