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
        // check if username already exists in the users table
        const checkUser = await pool.query(
            "SELECT * FROM users WHERE (username = $1)", [username]
        );
        // if the return is not null and there are no results of the same username, then the username is not taken and we can insert that new user
        if(checkUser !== null){
            if(checkUser.rowCount == 0){
                const addedUser = await pool.query(
                    "INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]
                );
            }else{
                console.log("Failed to signup, user already exists.")
            }
        }
    } catch (error){
        console.log(error);
    }
});

// this is used to create a workout in the database. An example of a workout would be a 
// workout split such "Push day", "heavy cardio", "Arm workout", etc. This is not used to
// insert something like "bench press". Use the exercises endpoints to work with those.
app.post('/api/createWorkout', async (req,res) => {
    const {username, password, name, description} = req.body;
    try {
        const userID = await pool.query(
            // this is a placeholder way of validating a user and looking up their id.
            "SELECT id FROM users WHERE (username = $1) and (password = $2)", [username, password]
        )
        //console.log(userID);
        if(userID.rows.length > 0){
            const addedWorkout = await pool.query(
                "INSERT INTO workout (user_id, name, description) VALUES ($1, $2, $3)", [userID.rows[0].id, name, description]
            )
            console.log(`Successfully added ${name} workout`)
        }else{
            console.log("no user found with those credentials")
        }
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log(`server has started on port: ${port}`);
});