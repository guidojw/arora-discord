'use strict'
const { Structures } = require('discord.js')
const { Member } = require('../models')

const NSadminGuildMember = Structures.extend('GuildMember', GuildMember => {
  class NSadminGuildMember extends GuildMember {
    async fetchPersistentRoles () {
      const data = await Member.scope('withRoles').findOne({
        where: {
          userId: this.id,
          guildId: this.guild.id
        }
      })
      return this.guild.roles.cache.filter(role => {
        return data?.roles.some(persistentRole => persistentRole.id === role.id) || false
      })
    }

    async persistRole (role) {
      await this.roles.add(role)
      const data = await getData(this)
      await data.createRole({ id: role.id, guildId: role.guild.id })
      return this
    }

    async unpersistRole (role) {
      const data = await getData(this)
      await data.removeRole(role.id)
      return this.roles.remove(role)
    }
  }

  return NSadminGuildMember
})

async function getData (member) {
  const [data] = await Member.findOrCreate({
    where: {
      userId: member.id,
      guildId: member.guild.id
    }
  })
  return data
}

module.exports = NSadminGuildMember
