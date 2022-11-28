const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule')
const token = '5870266794:AAHWa4yA_KYsVRtir_OHEYX9nX1MvtpQ4w8';

let bot = new TelegramBot(token, { polling: true });
let job;


const dayMap = new Map();

function dayDifference(day, msg) {
    let today = new Date().getTime();
    let endDay = new Date(day).getTime();
    let differenceDay = Math.ceil((endDay - today) / (1000 * 3600 * 24));
    bot.sendMessage(msg.chat.id, differenceDay + ' day left \u{1F389}');
}

bot.onText(/^\/\d{4}-\d{2}-\d{2}$/, (msg) => {
    msg.text = msg.text.split('/')[1]
    const day = msg.text
    bot.sendMessage(msg.chat.id, "OK, the cont down date is " + msg.text);
    dayDifference(day, msg);
    dayMap.set(msg.chat.id, day)
    job = schedule.scheduleJob('0 0 0 * * *', () => {
        dayDifference(day, msg);
    });
});

bot.onText(/^\/add/, function(msg) {
    bot.sendMessage(msg.chat.id, 'Please input the date you want to count down to in format /YYYY-MM-DD (e.g. /2023-12-25)');
});

bot.onText(/\/start/, message => {
    bot.sendMessage(message.chat.id, "Hola! Click on Add countdown or type /add to add \u{1F60D}.");
});

bot.onText(/\/stop/, message => {
    if (job) {
        job.cancel()
    }
});
