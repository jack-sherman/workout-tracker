const pg = require("pg");
require('dotenv').config();
var pool;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.INSTANCE_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
};
module.exports = {
    getPool: function() {
        if (pool) return pool;
        pool = new pg.Pool(config);
        return pool;
    }
};