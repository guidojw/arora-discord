'use strict'

const { Structures } = require('discord.js')
const { bloxlinkAdapter, roVerAdapter } = require('../adapters')
const { Member, Role } = require('../models')
const { VerificationProviders } = require('../util').Constants

const NSadminGuildMember = Structures.extend('GuildMember', GuildMember => {
  class NSadminGuildMember extends GuildMember {
    constructor (...args) {
      super(...args)

      this.verificationData = undefined
    }

    get robloxId () {
      return this.verificationData?.robloxId
    }

    get robloxUsername () {
      return this.verificationData?.robloxUsername
    }

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

      let data, error
      try {
        const fetch = verificationPreference === VerificationProviders.ROVER ? fetchRoVerData : fetchBloxlinkData
        data = await fetch(this.id, this.guild.id)
      } catch (err) {
        error = err
      }
      if ((data ?? false) === false) {
        try {
          const fetch = verificationPreference === VerificationProviders.ROVER ? fetchBloxlinkData : fetchRoVerData
          data = await fetch(this.id, this.guild.id)
        } catch (err) {
          throw error ?? err
        }
      }
      if (typeof data === 'number') {
        data = {
          robloxId: data,
          provider: VerificationProviders.BLOXLINK
        }
      } else if (data) {
        data.provider = VerificationProviders.ROVER
      }

      if (data === null || data.provider === this.guild.verificationPreference) {
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
    if (err.response?.data?.errorCode === 404) {
      return null
    }
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
    if (response.error.includes('not linked')) {
      return null
    }
    return response.status
  }

  return (response.matchingAccount !== null || response.primaryAccount !== null)
    ? parseInt(response.matchingAccount ?? response.primaryAccount)
    : null
}

module.exports = NSadminGuildMember
