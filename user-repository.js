const { getConnection } = require('./database-connection');
const { logger } = require('./logger');

function removeSubscription(chatId, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");
        collection.deleteMany({ "chatId": chatId }, function(err, result) {

            if (err) {
                return logger.info(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
}

function addUserSubscription(chatId, country, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");
        collection.insertOne({ "chatId": chatId, "country": country }, function(err, result) {
            if (err) {
                return logger.info(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

function getSubscriptions(country, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");
        collection.find({ "country": country }, function(err, result) {

            if (err) {
                return logger.info(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

module.exports = {
    addUserSubscription,
    removeSubscription,
    getSubscriptions
}