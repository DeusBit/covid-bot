const { parentPort } = require('worker_threads');
const { logger } = require('./logger');
const userRepository = require('./subscription-repository');
const config = require('./config.json');
const https = require('https');


const API_SEND_MESSAGE = `https://api.telegram.org/bot${config.BOT_TOKEN}/sendMessage?`;

const httpsAgent = new https.Agent({ maxSockets: 50 });

parentPort.on('message', (reply) => {
    reply.forEach((data) => {
        var country = data['Country,Other'];
        var text = generateText(data);
        userRepository.getSubscriptions(country, (subs) => {
            subs.forEach((subItem) => {
                https.get(`${API_SEND_MESSAGE}chat_id=${subItem.chatId}&text=${text}`, { agent: httpsAgent }, (res) => {
                    if (res.statusCode !== 200) {
                        logger.error(`HEADERS: ${JSON.stringify(res.headers)}`);
                        logger.error(`BODY: ${JSON.stringify(res.body)}`);
                    }
                }).on('error', (err) => {
                    logger.error(JSON.stringify(err));
                });
            });

        });
    });
});

function generateText(data) {
    return `Страна: ${data['Country,Other'] === 'Ukraine' ? 'Украина' : 'Россия'}%0AВсего случаев: ${data['TotalCases'] || 0}%0AНовых случаев: ${data['NewCases'] || 0}%0AВсего умерло: ${data['TotalDeaths'] || 0}%0AНовых смертей: ${data['NewDeaths'] || 0}%0AВсего вылечелось: ${data['TotalRecovered'] || 0}%0A%0AИ помните главное - не паникуйти, мойте руки и наслаждайтесь жизнью.`;
}