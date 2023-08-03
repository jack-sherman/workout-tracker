const express = require("express");
const cors = require("cors");
const db = require('./db');
const pool = db.getPool();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


async function UIDLookup(username, password){
    try {
        const userID = await pool.query(
            // this is a placeholder way of validating a user and looking up their id.
            "SELECT id FROM users WHERE (username = $1) and (password = $2)", [username, password]
        )
        if(userID.rows.length > 0){
            return userID.rows[0].id;
        }else{
            return -1;
        }
    } catch (error) {
        console.log(error);
    }
}
async function workoutLookup(username, password, name){
    try {
        const uid = await UIDLookup(username, password);
        console.log("looking up uid during workout lookup", uid)
        if(uid > 0){
            const workoutID = await pool.query(
                "SELECT id FROM workout WHERE (user_id = $1) and (name = $2)", [uid, name]
            )
            console.log(workoutID);
            if(workoutID.rows.length > 0){
                return workoutID.rows[0].id;
            }else{
                return -1;
            }
        }else{
            return -1;
        }
    } catch (error) {
        console.log(error);
    }
}

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
                res.sendStatus(200)
            }else{
                console.log("Failed to signup, user already exists.")
                res.sendStatus(400)
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
        const userID = await UIDLookup(username, password);
        if(userID > 0){
            const nameLookup = await pool.query(
                "SELECT * FROM workout WHERE (user_id = $1) and (name = $2)", [userID, name]
            )
            if(nameLookup.rows.length > 0){
                console.log(`Tried to add workout: ${name} for user ${userID}, but it already exists`)
                res.sendStatus(400);
            }else{
                const addedWorkout = await pool.query(
                    "INSERT INTO workout (user_id, name, description) VALUES ($1, $2, $3)", [userID, name, description]
                )
                console.log(`Successfully added ${name} workout`)
                res.sendStatus(200);
            }
        }else{
            console.log("no user found with those credentials")
            res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/api/createExercise', async (req, res) => {
    const {username, password, name, notes, weight, reps, sets, RPE, workout} = req.body;
    const workoutID = await workoutLookup(username, password, workout);
    const uid = await(UIDLookup(username, password));
    // dont need to check uid because its checked in in the workoutLookup function as well (this needs to be reoptimized later)
    // workoutid will be -1 if no user is found with the specified credentials
    if(workoutID > 0){
        const addedExercise = await pool.query(
            "INSERT INTO  exercise (user_id, name, notes, weight, reps, sets, RPE, workout) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
            [uid, name , notes, weight, reps, sets, RPE, workoutID]
        )
        console.log(`Added exercise ${name} for user ${username}`);
        res.sendStatus(200);
    }else{
        res.sendStatus(400);
    }
})

app.listen(port, () => {
    console.log(`server has started on port: ${port}`);
});