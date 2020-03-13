const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.label({ label: '[common]' }),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/info-log.log',
            maxsize: 5242880,
            maxFiles: 50,
            colorize: false
        })
    ]
});

module.exports = {
    logger
};