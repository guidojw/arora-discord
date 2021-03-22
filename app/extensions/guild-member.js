'use strict'
const { Structures } = require('discord.js')
const { Member, Role } = require('../models')

const NSadminGuildMember = Structures.extend('GuildMember', GuildMember => {
  class NSadminGuildMember extends GuildMember {
    canRunCommand (command) {
      let result = false
      const groupsChecked = []
      for (const role of this.roles.cache.values()) {
        for (const group of role.groups.cache.values()) {
          if (groupsChecked.includes(group.id)) {
            continue
          }
          result = group.permissionFor(command) ?? result
          if (result === false) {
            return false
          }
          groupsChecked.push(group.id)
        }
        result = role.permissionFor(command) ?? result
        if (result === false) {
          return false
        }
      }
      return result
    }

    async fetchPersistentRoles () {
      const data = await getData(this)

      return this.guild.roles.cache.filter(role => {
        return data?.roles.some(persistentRole => persistentRole.id === role.id) || false
      })
    }

    async persistRole (role) {
      await this.roles.add(role)
      const [data] = await Member.findOrCreate({ where: { userId: this.id, guildId: this.guild.id } })
      await Role.findOrCreate({ where: { id: role.id, guildId: this.guild.id } })
      const added = typeof await data.addRole(role.id) !== 'undefined'

      if (!added) {
        throw new Error('Member does already have role.')
      } else {
        return this
      }
    }

    async unpersistRole (role) {
      const data = await getData(this)
      const removed = await data?.removeRole(role.id) === 1

      if (!removed) {
        throw new Error('Member does not have role.')
      } else {
        return this.roles.remove(role)
      }
    }
  }

  return NSadminGuildMember
})

function getData (member) {
  return Member.scope('withRoles').findOne({
    where: {
      userId: member.id,
      guildId: member.guild.id
    }
  })
}

module.exports = NSadminGuildMember
