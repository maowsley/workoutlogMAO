const router = require("express").Router();
const {UserModel} = require("../models");
const {UniqueConstraintError} = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {

    let { username, passwordhash } = req.body.user;
    try {
    const User = await UserModel.create({
        username,
        passwordhash: bcrypt.hashSync(passwordhash, 13),
    });

    let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});

    res.status(201).json({
        message: "You have successfully signed up for WorkoutLog",
        user: User,
        sessionToken: token
    });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: "Oh no, username already in use",
            });
        } else {
        res.status(500).json({
            message: "Uh-oh failed to register user",
            });
        }
    }
});

router.post("/login", async (req, res) => {
    let { username, passwordhash} = req.body.user;
    try {
    const loginUser = await UserModel.findOne({
        where: {
            username: username,
        },
    });
    if (loginUser) {

        let passwordComparison = await bcrypt.compare(passwordhash, loginUser.passwordhash);

        if (passwordComparison) {

        let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
    res.status(200).json({
        user:loginUser,
        message: "Yay, user successfully logged in!",
        sessionToken: token
        });
    } else {
        res.status(401).json({
            message: "Incorrect username or password. Please try again"
        })
    }
    } else {
        res.status(401).json({
            message: "Incorrect username or password. Please try again"
        });
    }
    } catch (error) {
        res.status(500).json({
            message: "Oh, no failed to log user in"
        })
    }
});

module.exports = router;