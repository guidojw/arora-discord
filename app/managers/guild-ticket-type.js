'use strict'
const BaseManager = require('./base')

const { TicketType: TicketTypeModel } = require('../models')
const { TicketType } = require('../structures')

class GuildTicketTypeManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, TicketType)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create (name) {
    name = name.toLowerCase()
    if (this.resolve(name)) {
      throw new Error('A ticket type with that name already exists.')
    }

    const newData = await TicketTypeModel.create({ guildId: this.guild.id, name })

    return this.add(newData)
  }

  async delete (ticketType) {
    const id = this.resolveID(ticketType)
    if (!id) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket type not found.')
    }

    await TicketTypeModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async update (ticketType, data) {
    const id = this.resolveID(ticketType)
    if (!id) {
      throw new Error('Invalid ticke ttype.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket type not found.')
    }

    const changes = {}
    if (data.name) {
      if (this.resolve(data.name)) {
        throw new Error('A ticket type with that name already exists.')
      }
      changes.name = data.name.toLowerCase()
    }


    const [, [newData]] = await TicketTypeModel.update(changes, {
      where: { id },
      returning: true
    })

    const _ticketType = this.cache.get(id)
    _ticketType?._setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  resolve (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      idOrNameOrInstance = idOrNameOrInstance.toLowerCase()
      return this.cache.find(ticketType => ticketType.name.toLowerCase() === idOrNameOrInstance) || null
    }
    return super.resolve(idOrNameOrInstance)
  }

  resolveID (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      idOrNameOrInstance = idOrNameOrInstance.toLowerCase()
      return this.cache.find(ticketType => ticketType.name.toLowerCase() === idOrNameOrInstance)?.id ?? null
    }
    return super.resolveID(idOrNameOrInstance)
  }
}

module.exports = GuildTicketTypeManager
