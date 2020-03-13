const MongoClient = require("mongodb").MongoClient;
const config = require('./config.json');
const { logger } = require('./logger');

var client = null;

function getConnection() {
    if (client !== null) {
        return new Promise((resolve, reject) => {
            resolve(client);
        });
    }
    var mongoClient = new MongoClient(config.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        reconnectTries: 60000,
        reconnectInterval: 5000
    });

    return new Promise((resolve, reject) => {
        mongoClient.connect((err, clientConn) => {
            if (err) {
                logger.error(err);
                reject(err);
            } else {
                client = clientConn;
                resolve(client);
            }
        });
    })
}


module.exports = {
    getConnection
}