const pg = require("pg");
require('dotenv').config();


const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.INSTANCE_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});
exports = {pool}