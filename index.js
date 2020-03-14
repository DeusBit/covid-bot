const Telegraf = require('telegraf');
const session = require('telegraf/session');
const TelegrafInlineMenu = require('telegraf-inline-menu');
const { Worker } = require('worker_threads');
const statisticService = new Worker(__dirname + '/statistic-service.js');
const sendService = new Worker(__dirname + '/send-service.js');
const conf = require('./config.json');
const { logger } = require('./logger');
const subsRepo = require('./subscription-repository');

statisticService.on('message', (reply) => {
    sendService.postMessage(reply);
});

const menu = new TelegrafInlineMenu('Выберите страну для наблюдения');

menu.select('country', ['Украина', 'Италия'], {
    setFunc: (ctx, key) => {
        ctx.session.show = false;
        var chatId = ctx.update.callback_query.message.chat.id;
        var userId = ctx.update.callback_query.from.id;

        subsRepo.saveUserInformation(`${userId}-${chatId}`, { "from": ctx.update.callback_query.from, "chat": ctx.update.callback_query.message.chat });
        subsRepo.addUserSubscription(chatId, key === 'Украина' ? 'Ukraine' : 'Italy');
        ctx.reply(`Я буду информировать тебя если в ${key === 'Украина' ? 'Украине' : 'Италии'} будут новые случаи заражения.`)
    },
    hide: (ctx) => !ctx.session.show
});

menu.button('Сменить страну', 'chageCountry', {
    doFunc: (ctx) => {
        ctx.session.show = true;
    },
    hide: (ctx) => !!ctx.session.show
})

menu.setCommand('start')

const bot = new Telegraf(conf.BOT_TOKEN)
bot.use(session());
bot.use(menu.init());

bot.catch(error => {
    logger.error('telegraf error ' +
        error.response +
        '\n' +
        error.parameters +
        '\n' +
        error.on || error)
})

bot.command('stop', (ctx) => {
    var chatId = ctx.update.message.chat.id;

    subsRepo.removeSubscription(chatId);
});

function startup() {
    bot.launch()
    logger.info('Bot started as ' + bot.options.username);
}

startup()