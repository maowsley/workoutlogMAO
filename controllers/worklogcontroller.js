let Express = require("express");
let router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");

//Import the Workoutlog Model
const { WorkoutlogModel} = require("../models");

router.get("/practice", validateJWT, (req, res) => {
    res.send("Hey!! This is a pratice route!")
});

/*
===============================================================
Workout log /log/ POST method allow users to create workout log
==============================================================
*/

router.post("/log", validateJWT, async (req, res) => {
    const { description, definition, result } = req.body.workoutlog;
    const { id } = req.user;
    const workoutlogEntry = {
        description,
        definition,
        result,
        owner_id: id
    }
    try {
        const newWorkoutlog = await WorkoutlogModel.create(workoutlogEntry);
        res.status(200).json(newWorkoutlog);
    } catch (err) {
        res.status(500).json({error: err});
    }
    WorkoutlogModel.create(workoutlogEntry)
});

/*
Get all logs for an indiuvual user "/log/" */

router.get("/", async (req, res) => {
    try {
        const logs = await WorkoutlogModel.findAll();
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err});
    }
});

/* get individual logs by id for indiuvual user */

router.get("/log/:id", validateJWT, async (req, res) => {
    const {id } = req.user;
    try {
        const userWorkoutLog = await WorkoutlogModel.findAll({
            where: {
                owner_id: id
            }
        });
        res.status(200).json(userWorkoutLog);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

/* put allows indiviudal logs logs to updated by a user "/log/:id" */
router.put("/log/:id", validateJWT, async (req,res) => {
    const {description, definition, result} = req.body.workoutlog;
    const workoutLogId = req.params.id;
    const userId = req.user.id;

    const query = {
        where: {
            id: workoutLogId,
            id: userId
        }
    };

    const updatedWorkoutLog = {
        description: description,
        definition: definition,
        result: result
    };

    try {
        const update = await WorkoutlogModel.update(updatedWorkoutLog, query);
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

/* delete a workout log "/log/:id" delete statment */
router.delete("/log/:id", validateJWT, async (req, res) => {
    const ownerId = req.user.id;
    const workoutLogId = req.params.id;

    try {
        const query = {
            where: {
                owner_id: workoutLogId,
                owner_id: ownerId
            }
        };

        await WorkoutlogModel.destroy(query);
        res.status(200).json({message: "Workoutlog Entry Removed "});
    } catch (err) {
        res.status(500).json({error: err});
    }
});



module.exports = router;