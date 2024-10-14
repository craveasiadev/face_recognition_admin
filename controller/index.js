const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


require("./userController");
require("./deviceController");
require("./settingsController");
const initializeDatabase = require('../models/migrate'); 

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


app.whenReady().then(async () => {
    // Initialize the database before creating the main window
    try {
        await initializeDatabase(); // Ensure the DB is initialized
        createMainWindow();
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
