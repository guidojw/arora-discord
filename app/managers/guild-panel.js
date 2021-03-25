'use strict'
const BaseManager = require('./base')

const { MessageEmbed } = require('discord.js')
const { Panel: PanelModel } = require('../models')
const { discordService } = require('../services')
const { Panel } = require('../structures')

class GuildPanelManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Panel)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create (name, content) {
    if (this.resolve(name)) {
      throw new Error('A panel with that name already exists.')
    }
    const embed = new MessageEmbed(content)
    const valid = discordService.validateEmbed(embed)
    if (typeof valid === 'string') {
      throw new Error(valid)
    }
    content = JSON.stringify(embed.toJSON())

    const newData = await PanelModel.create({
      content,
      guildId: this.guild.id,
      name
    })

    return this.add(newData)
  }

  async delete (panel) {
    const id = this.resolveID(panel)
    if (!id) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Panel not found.')
    }

    await PanelModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async update (panel, data) {
    panel = this.resolve(panel)
    if (!panel) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(panel.id)) {
      throw new Error('Panel not found.')
    }

    const changes = {}
    const options = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name)) {
        throw new Error('A panel with that name already exists.')
      }
      changes.name = data.name
    }
    if (typeof data.content !== 'undefined') {
      const embed = new MessageEmbed(data.content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      changes.content = JSON.stringify(embed.toJSON())

      if (panel.message) {
        if (panel.message.partial) {
          await panel.message.fetch()
        }
        await panel.message.edit(embed)
      }
    }
    if (typeof data.channel !== 'undefined' && typeof data.message !== 'undefined') {
      const channel = this.guild.channels.resolve(data.channel)
      if (!channel) {
        throw new Error('Invalid channel.')
      }
      options.channelId = channel.id

      let message = channel.messages.resolve(data.message) ?? data.message
      try {
        if (message.partial) {
          message = await message.fetch()
        } else if (typeof message === 'string') {
          message = await channel.messages.fetch(message)
        }
      } catch {
        throw new Error('Invalid message.')
      }
      if (message.author.id !== this.client.user.id) {
        throw new Error(`Can only update message to messages posted by ${this.client.user}.`)
      }
      if (this.cache.some(otherPanel => otherPanel.messageId === message.id)) {
        throw new Error('Another panel is already posted in that message.')
      }
      changes.messageId = message.id
    }

    const [, [newData]] = await PanelModel.update(changes, {
      where: { id: panel.id },
      returning: true,
      ...options
    })
    await newData.reload()

    const _panel = this.cache.get(panel.id)
    _panel?._setup(newData)
    return _panel ?? this.add(newData, false)
  }

  async post (panel, channel) {
    panel = this.resolve(panel)
    if (!panel) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(panel.id)) {
      throw new Error('Panel not found.')
    }
    if (typeof channel !== 'undefined') {
      channel = this.guild.channels.resolve(channel)
      if (!channel) {
        throw new Error('Invalid channel.')
      }
    }

    const data = {
      messageId: null
    }
    if (typeof channel !== 'undefined') {
      const message = await channel.send(panel.embed)
      data.messageId = message.id
    }
    const [, [newData]] = await PanelModel.update(data, {
      where: { id: panel.id },
      channelId: channel?.id ?? null,
      returning: true,
      individualHooks: true
    })
    await newData.reload()

    const _panel = this.cache.get(panel.id)
    _panel?._setup(newData)
    return _panel ?? this.add(newData, false)
  }

  resolve (panel) {
    if (typeof panel === 'string') {
      panel = panel.toLowerCase()
      return this.cache.find(otherPanel => otherPanel.name.toLowerCase() === panel) || null
    }
    return super.resolve(panel)
  }

  resolveID (panel) {
    if (typeof panel === 'string') {
      panel = panel.toLowerCase()
      return this.cache.find(otherPanel => otherPanel.name.toLowerCase() === panel)?.id ?? null
    }
    return super.resolveID(panel)
  }
}

module.exports = GuildPanelManager
