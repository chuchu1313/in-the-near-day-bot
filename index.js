const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule')

// The following string can be changed to a template

class CustomBot {

    constructor(token) {

        if (!token) {
            throw new Error('Token must not be empty');
        }

        const options = {
            polling: true
        }

        // The structure of dayMap is key=fromId-chatId, value=daySet
        this.dayMap = new Map();
        // The structure of dayMap is key=fromId-chatId value=jobObj
        this.jobMap = new Map();
        this.bot = new TelegramBot(token, options);
        this.listenCommand();
    }

    /**
     * Adding event listeners
     */
    listenCommand() {

        // If there are new commands and corresponding operations to be added, you can refer to the following format
        this.bot.onText(/^\/add/, this.onAddCommand.bind(this));
        this.bot.onText(/\/start/, this.onStartCommand.bind(this));
        this.bot.onText(/\/stop/, this.onStopCommand.bind(this));
        this.bot.onText(/[\s\S]*/, this.onCommonStr.bind(this))

        this.bot.on("polling_error", console.error);
    }

    // listen handler start

    // Listening for add commands
    onAddCommand(msg) {
        const cmdAndDate = msg.text.split(' ')
        if (cmdAndDate.length !== 2) {
            this.sendMessage(msg.chat.id, 'Please enter the specified format /add date, e.g. /add 2023-12-25');
            return;
        }

        // Send success message
        const date = cmdAndDate[1]
        this.sendMessage(msg.chat.id, `OK, the count down date is ${date}`);

        const diffDay = this.dayDifference(date);
        this.sendMessage(msg.chat.id, '\u{1F60D} ' + diffDay + ' days left to ' + date + '\u{1F389}')

        this.updateDayMap(msg, date);
        this.updateJob(msg);
    }

    // Listening for start commands
    onStartCommand(msg) {
        this.sendMessage(msg.chat.id, "Hola! Click on Add countdown or type /add 2023-12-25 to add \u{1F60D}.");
    }

    // Listening for stop commands
    onStopCommand(msg) {
        this.stopJob(msg);
    }

    // Listening for generic string content
    onCommonStr(msg) {
        // console.log(msg)
    }

    // listen handler end


    /**
     * Update user subscription mapping
     * @param msg telegram request message body
     * @param date
     */
    updateDayMap(msg, date) {
        const key = `${msg.from.id}-${msg.chat.id}`;
        let dateSet = this.dayMap.get(key);

        if (!dateSet) {
            dateSet = new Set();
        }
        dateSet.add(date);
        this.dayMap.set(key, dateSet);
    }

    /**
     * Update original job
     * @description If fromId-chatId has a job running,
     * cancel it first and then add a new job,
     * otherwise, add the new job directly
     * @param msg
     */
    updateJob(msg) {
        if (!msg) {
            return;
        }

        this.stopJob(msg);

        const that = this;
        const job = schedule.scheduleJob('0 0 16 * * *', () => {
            const dateSet = that.dayMap.get(key);
            if (dateSet) {
                dateSet.forEach(date => {
                    const jobDiffDay = that.dayDifference(date);
                    that.sendMessage(key.split('-')[1], jobDiffDay + ' days left to ' + msg.text + '\u{1F389}');
                });
            }
        });

        const key = `${msg.from.id}-${msg.chat.id}`;
        this.jobMap.set(key, job);
    }

    /**
     * Stop job
     * @param msg
     */
    stopJob(msg) {
        const key = `${msg.from.id}-${msg.chat.id}`;
        let job = this.jobMap.get(key);

        if (job) {
            console.log(`Stop ${key} job`)
            job.cancel();
        }
    }

    /**
     * Calculate date difference
     * @param {*} day
     * @returns Date difference
     */
    dayDifference(day) {
        let today = new Date().getTime();
        let endDay = new Date(day).getTime();
        return Math.ceil((endDay - today) / (1000 * 3600 * 24));
    }

    sendMessage(chatId, msgStr) {
        this.bot.sendMessage(chatId, msgStr);
    }
}

const server = http.createServer((_, res) => {
    res.writeHead(200);
    res.end('OK');
});

server.listen(8080, () => {
    new CustomBot(process.env.TOKEN)
    console.log('Server started');
});

process.on('SIGTERM', () => server.close());

// TOKEN=5870266794:AAHWa4yA_KYsVRtir_OHEYX9nX1MvtpQ4w8 node index.js
