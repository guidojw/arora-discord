'use strict'
const path = require('path')
const Commando = require('discord.js-commando')
const pluralize = require('pluralize')
const Guild = require('./guild')
const SettingProvider = require('./setting-provider')
const WebSocketController = require('./web-socket')
const discordService = require('../services/discord')
const userService = require('../services/user')
const stringHelper = require('../helpers/string')
const TicketsController = require('./tickets')

const { MessageEmbed, DiscordAPIError } = require('discord.js')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

module.exports = class Bot {
  constructor () {
    this.client = new Commando.Client({
      commandPrefix: applicationConfig.defaultPrefix,
      owner: applicationConfig.owner,
      unknownCommandResponse: false,
      disableEveryone: true,
      partials: ['REACTION', 'MESSAGE', 'USER']
    })
    this.client.bot = this
    this.currentActivity = 0

    this.client.registry
      .registerGroup('admin', 'Admin')
      .registerGroup('main', 'Main')
      .registerGroup('miscellaneous', 'Miscellaneous')
      .registerGroup('bot', 'Bot')
      .registerGroup('voting', 'Voting')
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
    this.client.on('guildMemberAdd', this.guildMemberAdd.bind(this))
    this.client.on('commandRun', this.commandRun.bind(this))
    this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
    this.client.on('messageReactionRemove', this.messageReactionRemove.bind(this))

    if (applicationConfig.apiEnabled) {
      this.webSocketController = new WebSocketController(process.env.HOST)
      this.webSocketController.on('rankChanged', this.rankChanged.bind(this))
      this.webSocketController.on('trainDeveloperPayoutReport', this.trainDeveloperPayoutReport.bind(this))
    }

    this.client.login(process.env.DISCORD_TOKEN)
  }

  setActivity (name, options) {
    if (!name) {
      const activity = this.getNextActivity()
      name = activity.name
      options = activity.options
    }
    this.client.user.setActivity(name, options)
  }

  async ready () {
    // Instantiate a Guild instance for every guild
    for (const guildId of this.client.guilds.cache.keys()) {
      this.guilds[guildId] = new Guild(this, guildId)
      await this.guilds[guildId].loadData()
    }

    // Set the bot's main Guild
    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.getGuild(mainGuildId)

    // Set the client's SettingProvider
    await this.client.setProvider(new SettingProvider())

    // Instantiate the TicketsController for this bot
    this.ticketsController = new TicketsController(this.client)

    // Set the bot's activity and start the loop that updates the activity
    this.setActivity()
    setInterval(this.setActivity.bind(this), 60 * 1000)

    console.log(`Ready to serve on ${this.client.guilds.cache.size} servers, for ${this.client.users.cache.size} users.`)
  }

  async guildMemberAdd (member) {
    if (member.user.bot) {
      return
    }

    const guild = this.getGuild(member.guild.id)
    const embed = new MessageEmbed()
      .setTitle(`Hey ${member.user.tag},`)
      .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(guild.getData('primaryColor'))
    guild.guild.channels.cache.get(guild.getData('channels').welcomeChannel).send(embed)
  }

  async commandRun (command, promise, message) {
    if (!message.guild) {
      return
    }
    await promise

    await this.log(message.author, stripIndents`
    ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
    ${message.content}
    `)
  }

  async messageReactionAdd (reaction, user) {
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
    let member
    try {
      member = await guild.guild.members.fetch(user)
    } catch (err) {
      return
    }

    // Handle role messages
    const roleMessages = guild.getData('roleMessages')
    const roleMessage = roleMessages[reaction.message.id]
    if (roleMessage) {
      if (reaction.partial) {
        await reaction.fetch()
      }
      const emoji = reaction.emoji.id || reaction.emoji.name
      for (const binding of roleMessage) {
        if (binding.emoji === emoji) {
          return member.roles.add(binding.role)
        }
      }
    }

    // Handle votes
    const voteData = guild.getData('vote')
    if (voteData && voteData.timer && voteData.timer.end > Date.now()) {
      let choice
      for (const option of Object.values(voteData.options)) {
        if (option.votes.includes(member.id)) {
          return
        }
        if (reaction.message.id === option.message) {
          choice = option
        }
      }
      if (choice) {
        choice.votes.push(member.id)
        reaction.message.edit(reaction.message.embeds[0].setFooter(`Votes: ${choice.votes.length}`))
      }
    }
  }

  async messageReactionRemove (reaction, user) {
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
    let member
    try {
      member = await guild.guild.members.fetch(user)
    } catch (err) {
      return
    }

    // Handle role messages
    const roleMessages = guild.getData('roleMessages')
    const roleMessage = roleMessages[reaction.message.id]
    if (roleMessage) {
      const emoji = reaction.emoji.id || reaction.emoji.name
      for (const binding of roleMessage) {
        if (binding.emoji === emoji) {
          return member.roles.remove(binding.role)
        }
      }
    }
  }

  async rankChanged (groupId, userId, rank) {
    const username = (await userService.getUser(userId)).name
    for (const guild of Object.values(this.guilds)) {
      const member = await discordService.getMemberByName(guild.guild, username)

      if (member) {
        const roles = guild.getData('roles')
        if (roles[groupId]) {
          for (const [binding, role] of Object.entries(roles[groupId])) {
            const ranks = stringHelper.convertBinding(binding)

            if (ranks.includes(rank)) {
              member.roles.add(role)
            } else {
              member.roles.remove(role)
            }
          }
        }
      }
    }
  }

  getGuild (id) {
    return this.guilds[id]
  }

  getNextActivity () {
    this.currentActivity++
    if (this.currentActivity === 2) {
      this.currentActivity = 0
    }

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

  async trainDeveloperPayoutReport (developersSales) {
    const developerIds = Object.keys(developersSales)
    const developers = await userService.getUsers(developerIds)
    const emojis = this.mainGuild.getData('emojis')
    const emoji = this.mainGuild.guild.emojis.cache.find(emoji => emoji.id === emojis.robuxEmoji)

    const embed = new MessageEmbed()
      .setTitle('Train Developers Payout Report')
      .setColor(0xffffff)
    for (const [id, developerSales] of Object.entries(developersSales)) {
      // Add new field with developer totals to the main embed.
      const username = developers.find(developer => developer.id === parseInt(id)).name
      const total = Math.ceil(developerSales.total.robux)
      embed.addField(username, `Has sold **${developerSales.total.amount}** ${pluralize('train', developerSales.total.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${total}**${!emoji ? ' Robux' : ''}.`)

      // Message developers individually.
      try {
        const user = await this.client.users.fetch(developerSales.discordId)
        const userEmbed = new MessageEmbed()
          .setTitle('Weekly Train Payout Report')
          .setColor(0xffffff)
        for (const productSales of Object.values(developerSales.sales)) {
          userEmbed.addField(productSales.name, `Sold **${productSales.amount}** ${pluralize('time', productSales.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(productSales.robux)}**${!emoji ? ' Robux' : ''}.`)
        }
        userEmbed.addField('Total', `**${developerSales.total.amount}** trains and ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(developerSales.total.robux)}**${!emoji ? ' Robux' : ''}.`)
        user.send(userEmbed)
      } catch (err) {
        console.error(`Couldn't DM ${developerSales.discordId}!`)
      }
    }

    this.client.owners[0].send(embed)
  }

  log (author, content, footer) {
    const guild = this.mainGuild
    const embed = new MessageEmbed()
      .setAuthor(author.tag, author.displayAvatarURL())
      .setDescription(content)
      .setColor(guild.getData('primaryColor'))
    if (footer) {
      embed.setFooter(footer)
    }

    return guild.guild.channels.cache.get(guild.getData('channels').logsChannel).send(embed)
  }

  async send (user, content) {
    try {
      await user.send(content)
    } catch (err) {
      if (err instanceof DiscordAPIError) {
        // Most likely because the author has DMs closed,
        // do nothing
      } else {
        throw err
      }
    }
  }
}
