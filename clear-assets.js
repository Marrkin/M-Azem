#!/usr/bin/env node

/**
 * Simple script to clear all assets from the database
 */

require('dotenv').config();
const db = require('./src/config/database');

console.log('🧹 Clearing all assets from database...');

// Clear all assets from the database
const sql = 'DELETE FROM assets';

db.run(sql, [], function(err) {
    if (err) {
        console.error('❌ Error clearing assets:', err.message);
        process.exit(1);
    }

    const changes = this.changes;
    console.log(`✅ Successfully cleared ${changes} assets from database`);

    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
            process.exit(1);
        }
        console.log('🏁 Database connection closed');
    });
});
