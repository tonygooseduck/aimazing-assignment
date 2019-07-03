const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint' });
}

const errorHandler = (error, req, res, next) => {
    if (error.kind === 'ER_BAD_NULL_ERROR') {
        return res.send({ error: 'mysql error' });
    }
    next(error);
}

module.exports = {
    unknownEndpoint, errorHandler
}