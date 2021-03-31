'use strict'

const { Structures } = require('discord.js')
const { bloxlinkAdapter, roVerAdapter } = require('../adapters')
const { Member, Role } = require('../models')
const { userService } = require('../services')

const NSadminGuildMember = Structures.extend('GuildMember', GuildMember => {
  class NSadminGuildMember extends GuildMember {
    canRunCommand (command) {
      let result = null
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
      return result === true
    }

    async fetchPersistentRoles () {
      const data = await getData(this)

      return this.guild.roles.cache.filter(role => (
        data?.roles.some(persistentRole => persistentRole.id === role.id) || false
      ))
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

    async fetchVerificationData (verificationPreference = this.guild.verificationPreference) {
      if (this.verificationData?.provider === verificationPreference) {
        return this.verificationData
      }

      let data
      try {
        const fetch = verificationPreference === 'rover' ? fetchRoVerData : fetchBloxlinkData
        data = await fetch(this.id, this.guild.id)
      } catch (err) {
        try {
          const fetch = verificationPreference === 'rover' ? fetchBloxlinkData : fetchRoVerData
          data = await fetch(this.id, this.guild.id)
        } catch {
          throw err
        }
      }
      if (typeof data === 'number') {
        data = {
          robloxId: data,
          robloxUsername: (await userService.getUser(data)).name,
          provider: 'bloxlink'
        }
      } else {
        data.provider = 'rover'
      }

      if (data.provider === this.guild.verificationPreference) {
        this.verificationData = data
      }
      return data
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

async function fetchRoVerData (userId) {
  let response
  try {
    response = (await roVerAdapter('get', `/user/${userId}`)).data
  } catch (err) {
    throw err.response?.data?.error ?? err
  }

  return {
    robloxUsername: response.robloxUsername,
    robloxId: response.robloxId
  }
}

async function fetchBloxlinkData (userId, guildId) {
  const response = (await bloxlinkAdapter('get', `/user/${userId}${guildId ? `?guild=${guildId}` : ''}`)).data
  if (response.status === 'error') {
    throw response.error
  }

  return parseInt(response.matchingAccount ?? response.primaryAccount)
}

module.exports = NSadminGuildMember
