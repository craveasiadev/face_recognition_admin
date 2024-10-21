const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

require("./userController");
require("./deviceController");
require("./settingsController");
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
    createMainWindow(); // Always create the main window after checking the initialization
}

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
