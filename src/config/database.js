require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const projectRoot = path.resolve(__dirname, '../../');
const configuredDatabasePath = process.env.DATABASE_PATH || './data/patrimonio.sqlite';
const dbPath = path.resolve(projectRoot, configuredDatabasePath);
const dbDirectory = path.dirname(dbPath);
const databaseAlreadyExists = fs.existsSync(dbPath);

fs.mkdirSync(dbDirectory, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log(`Connected to the SQLite database at ${dbPath}.`);
        if (!databaseAlreadyExists) {
            console.log('SQLite database file was missing and has been created automatically.');
        }
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            location TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating assets table:', err);
        } else {
            console.log('Assets table ready.');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready.');
            db.get('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin'], (err, row) => {
                if (err) {
                    console.error('Error checking for admin user:', err);
                } else if (row.count === 0) {
                    bcrypt.hash('temp3333', 10, (err, hashedPassword) => {
                        if (err) {
                            console.error('Error hashing default admin password:', err);
                        } else {
                            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                                ['admin', hashedPassword, 'admin'], function(err) {
                                if (err) {
                                    console.error('Error creating default admin user:', err);
                                } else {
                                    console.log('Default admin user created (username: admin, password: temp3333). Please change this password immediately after logging in. :)');
                                }
                            });
                        }
                    });
                } else {
                    console.log('Admin user already exists.');
                }
            });
        }
    });
});

module.exports = db;
