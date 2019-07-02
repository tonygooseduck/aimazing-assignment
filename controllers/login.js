const loginRouter = require('express').Router();
const db = require('../models/db.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

loginRouter.post('/', async (req, res, next) => {
    const body = req.body;
    try {
        const user = await findUser(body.email);
        if (!user[0]) {
            return res.send({ error: 'Invalid email' });
        }
        const passwordCorrect = await bcrypt.compare(body.password, user[0].password);
        if (!passwordCorrect) {
            return res.send({ error: 'Password incorrect' });
        }
        let now = Date.now();
        const sha = crypto.createHash('sha256');
        sha.update(body.email + body.password + now);
        const accessToken = sha.digest('hex');
        const newToken = {
            access_token: accessToken,
            access_expired: now + 30 * 24 * 60 * 60 * 1000
        }
        const updateResult = await updateToken(user[0].id, newToken);
        console.log(updateResult);
        res.send(newToken);
    } catch (exception) {
        next(exception);
    }
});

function findUser(email) {
    return new Promise((resolve, reject) => {
        db.query('select * from user where email = ?', email, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
function updateToken(userId, token) {
    return new Promise((resolve, reject) => {
        db.query('update user set ? where id = ?', [token, userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
module.exports = loginRouter;