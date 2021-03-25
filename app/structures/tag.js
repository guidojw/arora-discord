'use strict'
const BaseStructure = require('./base')
const TagTagNameManager = require('../managers/tag-tag-name')

const { MessageEmbed } = require('discord.js')

class Tag extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this.names = new TagTagNameManager(this)

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this._content = data.content

    if (data.names) {
      for (const rawTagName of data.names) {
        this.names.add(rawTagName)
      }
    }
  }

  get content () {
    try {
      return new MessageEmbed(JSON.parse(this._content))
    } catch (err) {
      return this._content
    }
  }

  update (data) {
    return this.guild.tags.update(this, data)
  }

  delete () {
    return this.guild.tags.delete(this)
  }
}

module.exports = Tag
