const { parentPort } = require('worker_threads');
const { logger } = require('./logger');

parentPort.on('message', (reply) => {
    logger.info('New data:')
    logger.info(reply);

});