const transactionsRouter = require('express').Router();
const db = require('../models/db.js');

transactionsRouter.get('/', async (req, res, next) => {
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const transactions = await getAllTransactions(userId);
        res.send(transactions);
    } catch (exception) {
        next(exception);
    }
});

transactionsRouter.post('/', async (req, res, next) => {
    const body = req.body;
    const accessToken = getTokenFrom(req);
    try {
        if (!accessToken) {
            res.status(401).send({ error: 'token missing' });
        }
        const userId = await getUserId(accessToken);
        const outletCorrect = await checkOutlet(userId, body.outletId);
        if (!outletCorrect) {
            return res.send({ error: 'Invalid outlet id' });
        }
        const transaction = {
            outlet_id: body.outletId,
            product_name: body.productName,
            product_quantity: body.productQuantity,
            product_price: body.productPrice,
            date: Date.now()
        }
        const newTransaction = await createTransaction(transaction);
        res.send(newTransaction);
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

function checkOutlet(userId, outletId) {
    return new Promise((resolve, reject) => {
        db.query('select * from outlet where user_id = ? and id = ?', [userId, outletId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

function createTransaction(data) {
    return new Promise((resolve, reject) => {
        db.query('insert into transaction set ?', data, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function getAllTransactions(userId) {
    return new Promise((resolve, reject) => {
        let date = Date.now();
        const query = 'select outlet.name, product_name, product_quantity, product_price, date from user inner join outlet on user.id = outlet.user_id inner join transaction on outlet.id = transaction.outlet_id where user.id = ? order by date desc;'
        db.query(query, userId, (error, results) => {
            if (error) {
                reject(error);
            } else {
                for (let i = 0; i < results.length; i += 1) {
                    results[i].date = results[i].date - date;
                }
                resolve(results);
            }
        });
    });
}
module.exports = transactionsRouter;