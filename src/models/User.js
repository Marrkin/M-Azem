const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async create(data) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(data.password, 10, (err, hashedPassword) => {
                if (err) reject(err);

                const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
                const params = [data.username, hashedPassword, data.role || 'user'];

                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, username: data.username, role: data.role || 'user' });
                });
            });
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE users SET ';
            const params = [];
            const updates = [];

            if (data.username) {
                updates.push('username = ?');
                params.push(data.username);
            }

            if (data.password) {
                return bcrypt.hash(data.password, 10, (err, hashedPassword) => {
                    if (err) reject(err);
                    updates.push('password = ?');
                    params.push(hashedPassword);

                    updates.push('role = ?');
                    params.push(data.role || 'user');
                    params.push(id);

                    const finalSql = sql + updates.join(', ') + ' WHERE id = ?';

                    db.run(finalSql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ id, ...data });
                    });
                });
            }

            if (data.role) {
                updates.push('role = ?');
                params.push(data.role);
            }

            if (updates.length > 0) {
                params.push(id);
                const finalSql = sql + updates.join(', ') + ' WHERE id = ?';

                db.run(finalSql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...data });
                });
            } else {
                resolve({ id });
            }
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve({ deleted: true });
            });
        });
    }
}

module.exports = User;
