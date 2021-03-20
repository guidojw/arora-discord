'use strict'
const { Collection, Constants } = require('discord.js')
const { PartialTypes } = Constants
const { Member } = require('../models')

class TicketGuildMemberManager {
  constructor (ticket) {
    this.ticket = ticket
    this.client = ticket.client
    this.guild = ticket.guild
  }

  get cache () {
    const cache = new Collection()
    for (const moderatorId of this.ticket._moderators) {
      cache.set(moderatorId, this.guild.members.cache.get(moderatorId) ||
        (this.client.options.partials.includes(PartialTypes.GUILD_MEMBER)
          ? this.guild.members.add({ user: { id: moderatorId } })
          : null)
      )
    }
    return cache
  }

  async add (member) {
    member = this.guild.members.resolve(member)
    if (!member) {
      throw new Error('Invalid member.')
    }
    if (this.cache.has(member.id)) {
      throw new Error('Ticket already contains moderator.')
    }

    const [data] = await Member.findOrCreate({
      where: {
        userId: member.id,
        guildId: this.guild.id
      }
    })
    await data.addModeratingTicket(this.ticket.id)
    this.ticket._moderators.push(member.id)

    return this.ticket
  }
}

module.exports = TicketGuildMemberManager
