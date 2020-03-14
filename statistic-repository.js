const { getConnection } = require('./database-connection');
const { logger } = require('./logger');

function addStatistic(data, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("statistic");
        collection.insertOne(data, function(err, result) {

            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

function getLastStatistic(callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("statistic");
        collection.find().sort({ "update": -1 }).limit(1).toArray((err, result) => {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

module.exports = {
    addStatistic,
    getLastStatistic
}