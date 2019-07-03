const usersRouter = require('express').Router();
const db = require('../models/db.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

usersRouter.post('/', async (req, res, next) => {
    const body = req.body;
    try {
        const boolean = await checkEmail(body.email);
        if (!boolean) {
            return res.send({ error: 'Email already exists' });
        }
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds);
        let now = Date.now();
        const sha = crypto.createHash('sha256');
        sha.update(body.email + body.password + now);
        const accessToken = sha.digest('hex');
        const user = {
            name: body.name,
            email: body.email,
            password: passwordHash,
            access_token: accessToken,
            access_expired: now + 30 * 24 * 60 * 60 * 1000
        }
        const newUser = await createUser(user);
        res.cookie('access_token', accessToken);
        res.send(accessToken);
    } catch (exception) {
        next(exception);
    }
});

function checkEmail(email) {
    return new Promise((resolve, reject) => {
        db.query('select * from user where email = ?', email, (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length > 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}

function createUser(user) {
    return new Promise((resolve, reject) => {
        db.query('insert into user set ?', user, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
module.exports = usersRouter;