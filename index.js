const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule')
const token = process.env.TOKEN;

let bot = new TelegramBot(token, { polling: true });
let job;

const dayMap = new Map();

function dayDifference(day, msg) {
    let today = new Date().getTime();
    let endDay = new Date(day).getTime();
    let differenceDay = Math.ceil((endDay - today) / (1000 * 3600 * 24));
    bot.sendMessage(msg.chat.id, differenceDay + ' days left to ' + msg.text + '\u{1F389}');
}

bot.onText(/^\/\d{4}-\d{2}-\d{2}$/, (msg) => {
    msg.text = msg.text.split('/')[1]
    const day = msg.text
    bot.sendMessage(msg.chat.id, "OK, the count down date is " + msg.text);
    dayDifference(day, msg);
    dayMap.set(msg.chat.id, day)
    console.log(dayMap)
    job = schedule.scheduleJob('0 0 16 * * *', () => {
        dayDifference(day, msg);
    });
});

bot.onText(/^\/add/, function(msg) {
    bot.sendMessage(msg.chat.id, 'Please input the date you want to count down to in format /YYYY-MM-DD (e.g. /2023-12-25)');
});

bot.onText(/\/start/, message => {
    bot.sendMessage(message.chat.id, "Hola! Click on Add countdown or type /add to add \u{1F60D}.");
});

bot.onText(/\/stop/, () => {
    if (job) {
        job.cancel()
    }
});

const server = http.createServer((_, res) => {
    res.writeHead(200);
    res.end('OK');
});

server.listen(8080);

process.on('SIGTERM', () => server.close());
