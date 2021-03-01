'use strict'
const { BaseManager, MessageEmbed } = require('discord.js')
const { Panel: PanelModel } = require('../models')
const { discordService } = require('../services')
const { Panel } = require('../structures')

class GuildPanelManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Panel)

    this.guild = guild
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
      throw new Error('Guild does not contain panel.')
    }

    await PanelModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async post (name, channel) {

  }

  resolve(idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.get(idOrNameOrInstance) ||
        this.cache.find(panel => panel.name === idOrNameOrInstance) ||
        null
    }
    return super.resolve(idOrNameOrInstance)
  }

  resolveID(idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.find(panel => panel.name === idOrNameOrInstance)?.id ?? idOrNameOrInstance
    }
    return super.resolveID(idOrNameOrInstance)
  }
}

module.exports = GuildPanelManager
