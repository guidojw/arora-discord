'use strict'
const BaseManager = require('./base')

const { MessageEmbed } = require('discord.js')
const { Channel, Message, Panel: PanelModel } = require('../models')
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
    if (this.cache.some(panel => panel.name === name)) {
      throw new Error('A panel with that name already exists.')
    }
    let embed
    try {
      embed = new MessageEmbed(JSON.parse(content))
    } catch (err) {
      throw new Error('Content has to be a JSON object.')
    }
    const valid = discordService.validateEmbed(embed)
    if (typeof valid === 'string') {
      throw new Error(valid)
    }
    content = JSON.stringify(embed.toJSON())

    const panel = await PanelModel.create({ guildId: this.guild.id, name, content })

    return this.add(panel)
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

    if (data.content && panel.message) {
      if (panel.message.partial) {
        await panel.message.fetch()
      }
      await panel.message.edit(new MessageEmbed(JSON.parse(data.content)))
    }
    const [, [newData]] = await PanelModel.update({
      name: data.name,
      content: data.content
    }, {
      where: { id: panel.id },
      returning: true
    })

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
      channelId: channel?.id ?? null,
      messageId: null
    }
    if (channel) {
      const newMessage = await channel.send(panel.embed)
      data.messageId = newMessage.id
      await Channel.findOrCreate({
        where: {
          id: channel.id,
          guildId: this.guild.id
        }
      })
      await Message.findOrCreate({
        where: {
          id: newMessage.id,
          channelId: channel.id,
          guildId: this.guild.id
        }
      })
    }
    const [, [newData]] = await PanelModel.update(data, {
      where: { id: panel.id },
      returning: true
    })

    const _panel = this.cache.get(panel.id)
    _panel?._setup(newData)
    return _panel ?? this.add(newData, false)
  }

  resolve (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.get(idOrNameOrInstance) ||
        this.cache.find(panel => panel.name === idOrNameOrInstance) ||
        null
    }
    return super.resolve(idOrNameOrInstance)
  }

  resolveID (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.find(panel => panel.name === idOrNameOrInstance)?.id ?? idOrNameOrInstance
    }
    return super.resolveID(idOrNameOrInstance)
  }
}

module.exports = GuildPanelManager
