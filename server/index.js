const express = require("express");
const cors = require("cors");
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




app.listen(port, () => {
    console.log(`server has started on port: ${port}`);
    console.log(pool)
});