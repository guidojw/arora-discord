'use strict'
const { MessageEmbed } = require('discord.js')

module.exports = class BotEmbed extends MessageEmbed {
    constructor () {
        super()
            .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
            .setColor([255, 174, 12])
    }
}
