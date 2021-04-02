'use strict'

const BaseManager = require('./base')

const { MessageEmbed } = require('discord.js')
const { Tag: TagModel, TagName } = require('../models')
const { discordService } = require('../services')
const { Tag } = require('../structures')

class GuildTagManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Tag)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create (name, content) {
    name = name.toLowerCase()
    if (this.resolve(name)) {
      throw new Error('A tag with that name already exists.')
    }
    const first = name.split(/ +/)[0]
    if (name === 'all' ||
      this.client.registry.commands.some(command => command.name === first || command.aliases.includes(first))) {
      throw new Error('Not allowed, name is reserved.')
    }
    if (typeof content !== 'string') {
      const embed = new MessageEmbed(content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      content = JSON.stringify(embed.toJSON())
    } else {
      // Once a user fetches a tag, the bot replies to them with the tag content.
      // Tagging a user takes up 23 characters: 21 for tag format (<@snowflake>) + 2 for ", ".
      if (content.length + 23 > 2000) {
        throw new Error('Tag is too long.')
      }
    }

    const newData = await TagModel.create({
      guildId: this.guild.id,
      content,
      names: [{ name }]
    }, {
      include: [{
        model: TagName,
        as: 'names'
      }]
    })

    return this.add(newData)
  }

  async delete (tag) {
    const id = this.resolveID(tag)
    if (!id) {
      throw new Error('Invalid tag.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Tag not found.')
    }

    await TagModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async update (tag, data) {
    const id = this.resolveID(tag)
    if (!id) {
      throw new Error('Invalid tag.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Tag not found.')
    }

    const changes = {}
    if (data.content) {
      if (typeof data.content !== 'string') {
        const embed = new MessageEmbed(data.content)
        const valid = discordService.validateEmbed(embed)
        if (typeof valid === 'string') {
          throw new Error(valid)
        }
        changes.content = JSON.stringify(embed.toJSON())
      } else {
        if (data.content.length + 23 > 2000) {
          throw new Error('Tag is too long.')
        }
        changes.content = data.content
      }
    }

    const [, [newData]] = await TagModel.update(changes, {
      where: { id },
      returning: true
    })

    const _tag = this.cache.get(id)
    _tag?._setup(newData)
    return _tag ?? this.add(newData, false)
  }

  resolve (tag) {
    if (typeof tag === 'string') {
      return this.cache.find(otherTag => otherTag.names.resolve(tag) !== null) || null
    }
    return super.resolve(tag)
  }

  resolveID (tag) {
    if (typeof tag === 'string') {
      return this.cache.find(otherTag => otherTag.names.resolve(tag) !== null)?.id ?? null
    }
    return super.resolveID(tag)
  }
}

module.exports = GuildTagManager
