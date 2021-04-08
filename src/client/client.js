'use strict'

const path = require('path')
const eventHandlers = require('./events')
const AroraProvider = require('./setting-provider')
const WebSocketManager = require('./websocket/websocket')

const { DiscordAPIError, GuildEmoji } = require('discord.js')
const { PartialTypes } = require('discord.js').Constants
const { CommandoClient } = require('discord.js-commando')

const applicationConfig = require('../../config/application')

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000

require('../extensions') // Extend Discord.js structures before the client's collections get instantiated.

class AroraClient extends CommandoClient {
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
    if (!options.partials.includes(PartialTypes.GUILD_MEMBER)) {
      options.partials.push(PartialTypes.GUILD_MEMBER)
    }
    if (!options.partials.includes(PartialTypes.REACTION)) {
      options.partials.push(PartialTypes.REACTION)
    }
    if (!options.partials.includes(PartialTypes.MESSAGE)) {
      options.partials.push(PartialTypes.MESSAGE)
    }
    if (!options.partials.includes(PartialTypes.USER)) {
      options.partials.push(PartialTypes.USER)
    }
    super(options)

    this.currentActivity = 0

    this.registry
      .registerDefaultGroups()
      .registerDefaultTypes({ message: false })
      .registerDefaultCommands({
        help: true,
        prefix: true,
        eval: true,
        ping: true,
        unknownCommand: false,
        commandState: true
      })
      .unregisterCommand(this.registry.resolveCommand('groups')) // returns void..
    this.registry
      .registerGroup('admin', 'Admin')
      .registerGroup('bot', 'Bot')
      .registerGroup('main', 'Main')
      .registerGroup('miscellaneous', 'Miscellaneous')
      .registerGroup('settings', 'Settings')
      .registerTypesIn({ dirname: path.join(__dirname, '../types'), filter: /^(?!base.js).+$/ })
      .registerCommandsIn(path.join(__dirname, '../commands'))

    this.dispatcher.addInhibitor(requiresApiInhibitor)
    this.dispatcher.addInhibitor(requiresRobloxGroupInhibitor)
    this.dispatcher.addInhibitor(requiresSingleGuildInhibitor)

    if (applicationConfig.apiEnabled) {
      this.aroraWs = new WebSocketManager(this)
    }

    this.once('ready', this.ready.bind(this))
  }

  async ready () {
    await this.setProvider(new AroraProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId)

    this.bindEvent('channelDelete')
    this.bindEvent('commandCancel')
    this.bindEvent('commandError')
    this.bindEvent('commandPrefixChange')
    this.bindEvent('commandRun')
    this.bindEvent('commandStatusChange')
    this.bindEvent('emojiDelete')
    this.bindEvent('groupStatusChange')
    this.bindEvent('guildCreate')
    this.bindEvent('guildMemberAdd')
    this.bindEvent('guildMemberUpdate')
    this.bindEvent('message')
    this.bindEvent('messageDelete')
    this.bindEvent('messageDeleteBulk')
    this.bindEvent('messageReactionAdd')
    this.bindEvent('messageReactionRemove')
    this.bindEvent('roleDelete')
    this.bindEvent('voiceStateUpdate')

    this.startActivityCarousel()

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  async handleRoleMessage (type, reaction, user) {
    const guild = reaction.message.guild
    const member = guild.members.resolve(user) || await guild.members.fetch(user)

    for (const roleMessage of guild.roleMessages.cache.values()) {
      if (reaction.message.id === roleMessage.messageId && (reaction.emoji instanceof GuildEmoji
        ? roleMessage.emoji instanceof GuildEmoji && reaction.emoji.id === roleMessage.emojiId
        : !(roleMessage.emoji instanceof GuildEmoji) && reaction.emoji.name === roleMessage.emojiId)) {
        await member.roles[type](roleMessage.roleId)
      }
    }
  }

  startActivityCarousel () {
    if (!this.activityCarouselInterval) {
      this.activityCarouselInterval = this.setInterval(this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)
      return this.nextActivity(0)
    }
  }

  stopActivityCarousel () {
    this.clearInterval(this.activityCarouselInterval)
    this.activityCarouselInterval = undefined
  }

  nextActivity (activity) {
    this.currentActivity = (activity ?? this.currentActivity + 1) % 2
    switch (this.currentActivity) {
      case 0:
        return this.user.setActivity(`${this.commandPrefix}help`, { type: 'LISTENING' })
      case 1: {
        let totalMemberCount = 0
        for (const guild of this.guilds.cache.values()) {
          totalMemberCount += guild.memberCount
        }
        return this.user.setActivity(`${totalMemberCount} users`, { type: 'WATCHING' })
      }
    }
  }

  send (user, content) {
    return failSilently(user.send.bind(user, content), [50007])
    // 50007: Cannot send messages to this user, user probably has DMs closed.
  }

  deleteMessage (message) {
    return failSilently(message.delete.bind(message), [10008, ...(message.channel.type === 'dm' ? [50003] : [])])
    // 10008: Unknown message, the message was probably already deleted.
    // 50003: Cannot execute action on a DM channel, the bot cannot delete user messages in DMs.
  }

  async login (token = this.token) {
    await super.login(token)
    this.aroraWs?.connect()
  }

  bindEvent (eventName) {
    const handler = eventHandlers[eventName]
    this.on(eventName, (...args) => handler(this, ...args))
  }
}

function requiresApiInhibitor (msg) {
  if (msg.command?.requiresApi && !applicationConfig.apiEnabled) {
    return {
      reason: 'apiRequired',
      response: msg.reply('This command requires that the bot has an API connected.')
    }
  }
}

function requiresRobloxGroupInhibitor (msg) {
  if (msg.command?.requiresRobloxGroup && (!msg.guild || msg.guild.robloxGroupId === null)) {
    return {
      reason: 'robloxGroupRequired',
      response: msg.reply('This command requires that the server has its robloxGroup setting set.')
    }
  }
}

function requiresSingleGuildInhibitor (msg) {
  if (msg.command?.requiresSingleGuild && msg.client.guilds.cache.size !== 1) {
    return {
      reason: 'singleGuildRequired',
      response: msg.reply('This command requires the bot to be in only one guild.')
    }
  }
}

async function failSilently (fn, codes) {
  try {
    return await fn()
  } catch (err) {
    if (!(err instanceof DiscordAPIError) || !codes.includes(err.code)) {
      throw err
    }
  }
}

module.exports = AroraClient
