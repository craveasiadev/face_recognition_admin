const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


require("./userController");
require("./deviceController");
require("./settingsController");

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Correct path to preload.js
            nodeIntegration: true,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile('../view/dashboard.html');
}


app.whenReady().then(createMainWindow);

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
