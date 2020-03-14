const { getConnection } = require('./database-connection');
const { logger } = require('./logger');

function removeSubscription(chatId, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");
        collection.deleteMany({ "chatId": chatId }, function(err, result) {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
}

//add new subscription
function addUserSubscription(chatId, country, callback) {
    getUserSubscription(chatId, (res) => {
        if (res.length === 0) {
            insertUserSubscription(chatId, country, callback);
        } else {
            updateUserSubscription(chatId, country, callback);
        }
    });
};

function insertUserSubscription(chatId, country, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");

        collection.insertOne({ chatId, country }, (err, result) => {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

function updateUserSubscription(chatId, country, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");

        collection.updateOne({ "chatId": chatId }, { '$set': { chatId, country } }, { upsert: true }, (err, result) => {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });
};

function getUserSubscription(chatId, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");

        collection.find({ chatId }, (err, result) => {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                result.toArray((err, arr) => {
                    if (err) {
                        return logger.error(err);
                    }
                    callback(arr);
                });
            }
        });
    });
}

function getSubscriptions(country, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("subscription");
        collection.find({ "country": country }, function(err, result) {
            if (err) {
                return logger.error(err);
            }

            result.toArray((err, arr) => {
                if (err) {
                    return logger.error(err);
                }
                if (callback !== undefined) {
                    callback(arr);
                }
            });

        });
    });
};

function saveUserInformation(userId, data, callback) {
    getConnection().then((client) => {
        const db = client.db("coronavirus");
        const collection = db.collection("users");

        collection.updateOne({ "userId": userId }, { '$set': { data } }, { upsert: true }, (err, result) => {
            if (err) {
                return logger.error(err);
            }

            if (callback !== undefined) {
                callback(result);
            }
        });
    });

}

module.exports = {
    addUserSubscription,
    removeSubscription,
    getSubscriptions,
    saveUserInformation
}