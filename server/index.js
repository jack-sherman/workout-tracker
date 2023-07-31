const express = require("express");
const cors = require("cors");
const db = require('./db');
const pool = db.getPool();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


app.get('/api/users', async(req, res)=> {
    try{
        const users = await pool.query("SELECT * FROM users");
        res.json(users.rows)
    }
    catch(err) {
        console.error(err.message);
    }
});

app.post('/api/signup', async(req, res) => {
    const {username, password} = req.body;
    try{
        const addedUser = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]
        );
        console.log(addedUser)
    } catch (err){
        console.log(err);
    }
}
)

app.listen(port, () => {
    console.log(`server has started on port: ${port}`);
});