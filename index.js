const Telegraf = require('telegraf');
const session = require('telegraf/session');
const TelegrafInlineMenu = require('telegraf-inline-menu');
const { Worker } = require('worker_threads');
const statisticService = new Worker(__dirname + '/statistic-service.js');
const sendService = new Worker(__dirname + '/send-service.js');
const conf = require('./config.json');
const { logger } = require('./logger');

statisticService.on('message', (reply) => {
    sendService.postMessage(reply);
});

const menu = new TelegrafInlineMenu('Выберите страну для наблюдения');

menu.select('country', ['Украина', 'Росcия'], {
    setFunc: async(ctx, key) => {
        ctx.session.hide = true
        await ctx.reply(`Я буду информировать тебя если в ${key === 'Украина' ? 'Украине' : 'России'} будут новые случаи заражения.`)
    },
    hide: (ctx) => ctx.session.hide
});

menu.setCommand('start')

const bot = new Telegraf(conf.BOT_TOKEN)
bot.use(session())

bot.catch(error => {
    logger.info('telegraf error', error.response, error.parameters, error.on || error)
})

async function startup() {
    await bot.launch()
    logger.info(new Date(), 'Bot started as', bot.options.username)
}

startup()