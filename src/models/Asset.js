const db = require('../config/database');

class Asset {
    static getAll(limit = null, offset = 0) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM assets ORDER BY created_at DESC';
            const params = [];

            if (limit !== null) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(limit, offset);
            }

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getAllFiltered(limit = null, offset = 0, whereClause = '', params = []) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM assets' + whereClause + ' ORDER BY created_at DESC';
            const queryParams = [...params];

            if (limit !== null) {
                sql += ' LIMIT ? OFFSET ?';
                queryParams.push(limit, offset);
            }

            db.all(sql, queryParams, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getCount() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM assets';
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }

    static getCountFiltered(whereClause = '', params = []) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM assets' + whereClause;
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM assets WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static create(data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO assets (asset_number, name, quantity, location, description) VALUES (?, ?, ?, ?, ?)`;
            const params = [data.asset_number, data.name, data.quantity, data.location, data.description];
            
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE assets SET asset_number = ?, name = ?, quantity = ?, location = ?, description = ? WHERE id = ?`;
            const params = [data.asset_number, data.name, data.quantity, data.location, data.description, id];

            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM assets WHERE id = ?';
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve({ deleted: true });
            });
        });
    }

    static getDistinctLocations() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT DISTINCT location FROM assets WHERE location IS NOT NULL AND location != "" ORDER BY location';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.location));
            });
        });
    }
}

module.exports = Asset;
