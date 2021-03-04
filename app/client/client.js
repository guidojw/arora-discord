'use strict'
const path = require('path')
const eventHandlers = require('./events')
const NSadminProvider = require('./setting-provider')
const TicketsController = require('./tickets')
const WebSocketManager = require('./websocket/websocket')

const { DiscordAPIError, Message } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { RoleMessage } = require('../models')

const applicationConfig = require('../../config/application')

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000
const COMMAND_DELETE_MESSAGES_TIMEOUT = 10 * 1000

require('../extensions') // Extend Discord.js structures before the client's collections get instantiated.

class NSadminClient extends CommandoClient {
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
      .registerTypesIn(path.join(__dirname, '../types'))
      .registerCommandsIn(path.join(__dirname, '../commands'))

    this.once('ready', this.ready.bind(this))
  }

  async ready () {
    await this.setProvider(new NSadminProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId)

    this.ticketsController = new TicketsController(this)
    await this.ticketsController.init()

    this.bindEvent('channelDelete')
    this.bindEvent('commandError')
    this.bindEvent('commandPrefixChange')
    this.bindEvent('commandRun')
    this.bindEvent('commandStatusChange')
    this.bindEvent('emojiDelete')
    this.bindEvent('groupStatusChange')
    this.bindEvent('guildCreate')
    this.bindEvent('guildMemberAdd')
    this.bindEvent('message')
    this.bindEvent('messageDelete')
    this.bindEvent('messageDeleteBulk')
    this.bindEvent('messageReactionAdd')
    this.bindEvent('messageReactionRemove')
    this.bindEvent('roleDelete')

    if (applicationConfig.apiEnabled) {
      this.ws = new WebSocketManager(this)
    }

    this.setActivity()
    setInterval(this.setActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  async handleCommandDeleteMessages (command, result, message, collResult) {
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
    return failSilently(user.send.bind(user, content), [50007])
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

  bindEvent (eventName) {
    const handler = eventHandlers[eventName]
    this.on(eventName, (...args) => handler(this, ...args))
  }
}

async function failSilently (fn, codes) {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof DiscordAPIError && !codes.includes(err.code)) {
      throw err
    }
  }
}

module.exports = NSadminClient
