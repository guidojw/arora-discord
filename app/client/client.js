'use strict'
const Commando = require('discord.js-commando')
const path = require('path')
const SettingProvider = require('./setting-provider')
const TicketsController = require('./tickets')
const WebSocketManager = require('./websocket/websocket')

const { DiscordAPIError, Message, MessageEmbed } = require('discord.js')
const { RoleMessage, Tag, TagName } = require('../models')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000
const COMMAND_DELETE_MESSAGES_TIMEOUT = 10 * 1000

require('../extensions') // Extend Discord.js structures before the client's collections get instantiated.

class NSadminClient extends Commando.Client {
  constructor (options = {}) {
    if (typeof options.commandPrefix === 'undefined') {
      options.commandPrefix = applicationConfig.defaultPrefix
    }
    if (typeof options.owner === 'undefined') {
      options.owner = applicationConfig.owner
    }
    if (typeof options.invite === 'undefined') {
      options.invite = applicationConfig.invite
    }
    if (!options.partials) {
      options.partials = []
    }
    if (!options.partials.some(partial => partial === 'REACTION')) {
      options.partials.push('REACTION')
    }
    if (!options.partials.some(partial => partial === 'MESSAGE')) {
      options.partials.push('MESSAGE')
    }
    if (!options.partials.some(partial => partial === 'USER')) {
      options.partials.push('USER')
    }
    super(options)

    this.currentActivity = 0

    this.registry
      .registerGroup('admin', 'Admin')
      .registerGroup('settings', 'Settings')
      .registerGroup('main', 'Main')
      .registerGroup('miscellaneous', 'Miscellaneous')
      .registerGroup('bot', 'Bot')
      .registerGroup('tickets', 'Tickets')
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({
        commandState: true,
        unknownCommand: false,
        ping: true,
        help: true,
        eval: true,
        prefix: true
      })
      .registerCommandsIn(path.join(__dirname, '../commands'))

    this.once('ready', this.ready.bind(this))
  }

  async ready () {
    await this.setProvider(new SettingProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId)

    this.ticketsController = new TicketsController(this)
    await this.ticketsController.init()

    this.on('commandError', this.commandError.bind(this))
    this.on('commandRun', this.commandRun.bind(this))
    this.on('guildMemberAdd', this.guildMemberAdd.bind(this))
    this.on('messageReactionAdd', this.messageReactionAdd.bind(this))
    this.on('messageReactionRemove', this.messageReactionRemove.bind(this))
    this.on('message', this.message.bind(this))

    if (applicationConfig.apiEnabled) {
      this.ws = new WebSocketManager(this)
    }

    this.setActivity()
    setInterval(this.setActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  async commandError (command, err, message, args, fromPattern, collResult) {
    if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
      await message.reply(err.response.data.errors[0].message || err.response.data.errors[0].msg)
    } else {
      await message.reply(err.message || err.msg)
    }

    await this.handleCommandDeleteMessages(command, err, message, args, fromPattern, collResult)

    const guild = message.guild ? this.guilds.cache.get(message.guild.id) : this.mainGuild
    await guild.log(
      message.author,
      stripIndents`
      ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
      ${message.content}
      `,
      { color: 0xff0000 }
    )
  }

  async commandRun (command, promise, message, args, fromPattern, collResult) {
    let result
    try {
      result = await promise
    } catch (err) {
      // Command execution errors are handled by the commandError event.
      return
    }

    await this.handleCommandDeleteMessages(command, result, message, args, fromPattern, collResult)

    const guild = message.guild ? this.guilds.cache.get(message.guild.id) : this.mainGuild
    await guild.log(
      message.author,
      stripIndents`
      ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
      ${message.content}
      `
    )
  }

  async handleCommandDeleteMessages (command, result, message, _args, _fromPattern, collResult) {
    if (!command.deleteMessages) {
      return
    }

    await Promise.all([
      ...collResult.prompts.map(this.deleteMessage.bind(this)),
      ...collResult.answers.map(this.deleteMessage.bind(this)),
      message.delete()
    ])
    if (result instanceof Message) {
      setTimeout(this.deleteMessage.bind(this, result), COMMAND_DELETE_MESSAGES_TIMEOUT)
    } else if (result instanceof Array) {
      setTimeout(() => {
        return Promise.all(result.map(this.deleteMessage.bind(this)))
      }, COMMAND_DELETE_MESSAGES_TIMEOUT)
    }
  }

  guildMemberAdd (member) {
    if (member.user.bot) {
      return
    }

    const guild = this.guilds.cache.get(member.guild.id)
    if (guild.welcomeChannel) {
      const embed = new MessageEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(guild.getData('primaryColor'))
      return guild.welcomeChannel.send(embed)
    }
  }

  async messageReactionAdd (reaction, user) {
    await this.handleRoleMessage('add', reaction, user)
  }

  async messageReactionRemove (reaction, user) {
    await this.handleRoleMessage('remove', reaction, user)
  }

  async handleRoleMessage (type, reaction, user) {
    if (user.bot) {
      return
    }
    if (reaction.message.partial) {
      await reaction.message.fetch()
    }
    if (!reaction.message.guild) {
      return
    }
    const guild = this.guilds.cache.get(reaction.message.guild.id)
    const member = await guild.members.fetch(user)

    const roleMessages = await RoleMessage.findAll({
      where: {
        guildId: guild.id,
        messageId: reaction.message.id
      }
    })
    if (roleMessages) {
      const emojiId = reaction.emoji.id || reaction.emoji.name
      for (const roleMessage of roleMessages) {
        if (roleMessage.emojiId === emojiId || roleMessage.emoji === emojiId) {
          await member.roles[type](roleMessage.roleId)
        }
      }
    }
  }

  async message (message) {
    if (message.author.bot) {
      return
    }
    if (!message.guild) {
      return
    }
    const guild = this.guilds.cache.get(message.guild.id)
    const prefix = guild.commandPrefix ?? this.commandPrefix

    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/)
      const tagName = args.shift().toLowerCase()
      if (tagName) {
        const tag = await Tag.findOne({
          where: { guildId: guild.id },
          include: [{ model: TagName, as: 'names', where: { name: tagName } }]
        })

        if (tag) {
          try {
            const embed = new MessageEmbed(JSON.parse(tag.content))

            return message.reply(embed)
          } catch (err) {
            return message.reply(tag.content)
          }
        }
      }
    }
  }

  getNextActivity () {
    this.currentActivity++
    this.currentActivity %= 2

    switch (this.currentActivity) {
      case 0:
        return { name: `${this.commandPrefix}help`, options: { type: 'LISTENING' } }
      case 1: {
        let totalMemberCount = 0
        for (const guild of this.guilds.cache.values()) {
          totalMemberCount += guild.memberCount
        }
        return { name: `${totalMemberCount} users`, options: { type: 'WATCHING' } }
      }
    }
  }

  setActivity (name, options) {
    if (!name) {
      const activity = this.getNextActivity()
      name = activity.name
      options = activity.options
    }
    return this.user.setActivity(name, options)
  }

  send (user, content) {
    return failSilently(user.send.bind(this, content), [50007])
    // Most likely because the author has DMs closed,
    // do nothing.
  }

  deleteMessage (message) {
    return failSilently(message.delete, [10008])
    // Discord API Unknown message error, the message
    // was probably already deleted.
  }

  async login (token = this.token) {
    await super.login(token)
    this.ws.connect()
  }
}

async function failSilently(fn, codes) {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof DiscordAPIError && !codes.includes(err.code)) {
      throw err
    }
  }
}

module.exports = NSadminClient
