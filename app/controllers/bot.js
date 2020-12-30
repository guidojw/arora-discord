'use strict'
const EventEmitter = require('events')
const Commando = require('discord.js-commando')
const path = require('path')
const pluralize = require('pluralize')
const discordService = require('../services/discord')
const SettingProvider = require('./setting-provider')
const TicketsController = require('./tickets')
const userService = require('../services/user')
const WebSocketManager = require('../managers/web-socket')

const { DiscordAPIError, Message, MessageEmbed } = require('discord.js')
const { RoleBinding, RoleMessage, Tag, TagName } = require('../models')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000
const COMMAND_DELETE_MESSAGES_TIMEOUT = 10 * 1000

class BotController extends EventEmitter {
  constructor () {
    super()

    this.client = new Commando.Client({
      commandPrefix: applicationConfig.defaultPrefix,
      owner: applicationConfig.owner,
      unknownCommandResponse: false,
      disableEveryone: true,
      partials: ['REACTION', 'MESSAGE', 'USER'],
      commandEditableDuration: 0
    })
    this.client.bot = this
    this.currentActivity = 0

    this.client.registry
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

    this.guilds = {}

    this.client.once('ready', this.ready.bind(this))
  }

  async ready () {
    await this.client.setProvider(new SettingProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.getGuild(mainGuildId)

    this.ticketsController = new TicketsController(this.client)
    await this.ticketsController.init()

    this.client.on('commandError', this.commandError.bind(this))
    this.client.on('commandRun', this.commandRun.bind(this))
    this.client.on('guildMemberAdd', this.guildMemberAdd.bind(this))
    this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
    this.client.on('messageReactionRemove', this.messageReactionRemove.bind(this))
    this.client.on('message', this.message.bind(this))

    if (applicationConfig.apiEnabled) {
      this.webSocketController = new WebSocketManager(process.env.HOST)
      this.webSocketController.on('rankChanged', this.rankChanged.bind(this))
      this.webSocketController.on('trainDeveloperPayoutReport', this.trainDeveloperPayoutReport.bind(this))
    }

    this.setActivity()
    setInterval(this.setActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)

    console.log(`Ready to serve on ${this.client.guilds.cache.size} servers, for ${this.client.users.cache.size} users.`)
  }

  async commandError (command, err, message, args, fromPattern, collResult) {
    if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
      await message.reply(err.response.data.errors[0].message || err.response.data.errors[0].msg)
    } else {
      await message.reply(err.message || err.msg)
    }

    await this.handleCommandDeleteMessages(command, err, message, args, fromPattern, collResult)

    const guild = message.guild ? this.getGuild(message.guild.id) : this.mainGuild
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

    const guild = message.guild ? this.getGuild(message.guild.id) : this.mainGuild
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

    const guild = this.getGuild(member.guild.id)
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
    const guild = this.getGuild(reaction.message.guild.id)
    const member = await guild.guild.members.fetch(user)

    const roleMessages = await RoleMessage.findAll({
      where: {
        guildId: guild.id,
        messageId: reaction.message.id
      }
    })
    if (roleMessages) {
      const emojiId = reaction.emoji.id || reaction.emoji.name
      for (const roleMessage of roleMessages) {
        if (roleMessage.emojiId === emojiId) {
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
    const guild = this.getGuild(message.guild.id)
    const prefix = guild.guild.commandPrefix ?? this.client.commandPrefix

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

  async rankChanged (groupId, userId, rank) {
    let username
    for (const guild of Object.values(this.guilds)) {
      if (guild.groupId === groupId) {
        if (!username) {
          username = (await userService.getUser(userId)).name
        }
        const member = await discordService.getMemberByName(guild.guild, username)

        if (member) {
          const roleBindings = await RoleBinding.findAll({ where: { guildId: guild.id, robloxGroupId: groupId } })
          for (const roleBinding of roleBindings) {
            if (rank === roleBinding.min || (roleBinding.max && rank >= roleBinding.min && rank <= roleBinding.max)) {
              await member.roles.add(roleBinding.roleId)
            } else {
              await member.roles.remove(roleBinding.roleId)
            }
          }
        }
      }
    }
  }

  async trainDeveloperPayoutReport (developersSales) {
    const developerIds = Object.keys(developersSales)
    const developers = await userService.getUsers(developerIds)
    const emoji = this.mainGuild.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'robux')

    const embed = new MessageEmbed()
      .setTitle('Train Developers Payout Report')
      .setColor(0xffffff)
    for (const [id, developerSales] of Object.entries(developersSales)) {
      const username = developers.find(developer => developer.id === parseInt(id)).name
      const total = Math.ceil(developerSales.total.robux)
      embed.addField(username, `Has sold **${developerSales.total.amount}** ${pluralize('train', developerSales.total.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${total}**${!emoji ? ' Robux' : ''}.`)

      try {
        const user = await this.client.users.fetch(developerSales.discordId)
        const userEmbed = new MessageEmbed()
          .setTitle('Weekly Train Payout Report')
          .setColor(0xffffff)
        for (const productSales of Object.values(developerSales.sales)) {
          userEmbed.addField(productSales.name, `Sold **${productSales.amount}** ${pluralize('time', productSales.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(productSales.robux)}**${!emoji ? ' Robux' : ''}.`)
        }
        userEmbed.addField('Total', `**${developerSales.total.amount}** trains and ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(developerSales.total.robux)}**${!emoji ? ' Robux' : ''}.`)

        await user.send(userEmbed)
      } catch (err) {
        console.error(`Couldn't DM ${developerSales.discordId}!`)
      }
    }

    for (const owner of this.client.owners) {
      if (owner.partial) {
        await owner.fetch()
      }

      await owner.send(embed)
    }
  }

  getGuild (id) {
    return this.guilds[id]
  }

  getNextActivity () {
    this.currentActivity++
    this.currentActivity %= 2

    switch (this.currentActivity) {
      case 0:
        return { name: `${this.client.commandPrefix}help`, options: { type: 'LISTENING' } }
      case 1: {
        let totalMemberCount = 0
        for (const guild of Object.values(this.guilds)) {
          totalMemberCount += guild.guild.memberCount
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
    return this.client.user.setActivity(name, options)
  }

  async send (user, content) {
    try {
      return await user.send(content)
    } catch (err) {
      if (err instanceof DiscordAPIError && err.code === 50007) {
        // Most likely because the author has DMs closed,
        // do nothing.
      } else {
        throw err
      }
    }
  }

  async deleteMessage (message) {
    try {
      return await message.delete()
    } catch (err) {
      if (err instanceof DiscordAPIError && err.code === 10008) {
        // Discord API Unknown message error, the message
        // was probably already deleted.
      } else {
        throw err
      }
    }
  }

  login (token) {
    return this.client.login(token)
  }
}

module.exports = BotController
