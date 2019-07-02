const outletsRouter = require('express').Router();
const db = require('../models/db.js');

outletsRouter.get('/', async (req, res) => {
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const outlets = await getAll(userId);
        res.json(outlets);
    } catch (exception) {
        next(exception);
    }
});

outletsRouter.get('/:id', async (req, res, next) => {
    const outletId = req.params.id;
    try {
        const outlet = await getOne(outletId);
        res.send(outlet);
    } catch (exception) {
        next(exception);
    }
});

outletsRouter.post('/', async (req, res, next) => {
    const body = req.body;
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const status = await insert(body, userId);
        res.sendStatus(status);
    } catch (exception) {
        next(exception);
    }
});

outletsRouter.delete('/:id', async (req, res, next) => {
    const outletId = req.params.id;
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const status = await deleteOutlet(userId, outletId);
        res.sendStatus(204);
    } catch (exception) {
        next(exception);
    }
});

outletsRouter.put('/:id', async (req, res, next) => {
    const outletId = req.params.id;
    const body = req.body;
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const newOutlet = await updateOutlet(body, userId, outletId);
        res.json(newOutlet);
    } catch (exception) {
        next(exception);
    }
});

function getTokenFrom(request) {
    const authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.replace("Bearer ", "");
    } else {
        return null;
    }
}
function getUserId(accessToken) {
    return new Promise((resolve, reject) => {
        let query = 'select * from user where access_token = ?';
        db.query(query, [accessToken], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length == 0) {
                    resolve({ error: 'Invalid Access Token' });
                } else {
                    resolve(results[0].id);
                }
            }
        });
    });
}
function getAll(userId) {
    return new Promise((resolve, reject) => {
        db.query('select * from outlet where user_id = ?', [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
function getOne(outletId) {
    return new Promise((resolve, reject) => {
        db.query('select * from outlet where id = ?', [outletId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    name: results[0].name,
                    phone: results[0].phone,
                    address: results[0].address
                });
            }
        });
    });
}
function insert(body, userId) {
    return new Promise((resolve, reject) => {
        let outlet = {
            user_id: userId,
            name: body.name,
            phone: body.phone,
            address: body.address
        };
        db.query('insert into outlet set ?', outlet, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(201);
            }
        });
    })
}

function deleteOutlet(userId, outletId) {
    return new Promise((resolve, reject) => {
        db.query('delete from outlet where user_id = ? and id = ?', [userId, outletId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(204);
            }
        });
    });
}

function updateOutlet(body, userId, outletId) {
    return new Promise((resolve, reject) => {
        let outlet = {
            name: body.name,
            phone: body.phone,
            address: body.address
        };
        db.query('update outlet set ? where user_id = ? and id = ?', [outlet, userId, outletId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
module.exports = outletsRouter;