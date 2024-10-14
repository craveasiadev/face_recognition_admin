const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'data.db');
const db = new sqlite3.Database(dbPath);

module.exports = db;
