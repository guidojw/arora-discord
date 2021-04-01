'use strict'

const { ArgumentType } = require('discord.js-commando')
const { userService } = require('../services')

class RobloxUserArgumentType extends ArgumentType {
  constructor (client) {
    super(client, 'roblox-user')

    this.cache = new Map()
  }

  async validate (val, msg, arg) {
    const key = `${msg.guild.id}_${val}`
    const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/)
    if (matches) {
      try {
        const member = await msg.guild.members.fetch(await msg.client.users.fetch(matches[1]))
        if (member && !member.user.bot) {
          const verificationData = await member.fetchVerificationData()
          if (verificationData) {
            return validateAndSet.call(this, arg, key, verificationData.robloxId, verificationData.robloxUsername)
          }
        }
      } catch {} // eslint-disable-line no-empty

      const id = parseInt(matches[0].match(/^(\d+)$/)?.[1])
      if (!isNaN(id)) {
        try {
          const username = (await userService.getUser(id)).name
          return validateAndSet.call(this, arg, key, id, username)
        } catch {} // eslint-disable-line no-empty
      } else {
        return false
      }
    }

    const search = val.toLowerCase()
    const members = msg.guild?.members.cache.filter(memberFilterExact(search))
    if (members?.size === 1) {
      const member = members.first()
      const verificationData = await member.fetchVerificationData()
      if (verificationData) {
        return validateAndSet.call(this, arg, key, verificationData.robloxId, verificationData.robloxUsername)
      }
    }

    if (!search.includes(' ')) {
      try {
        const id = await userService.getIdFromUsername(search)
        return validateAndSet.call(this, arg, key, id, search)
      } catch {} // eslint-disable-line no-empty
    }
    return false
  }

  parse (val, msg, arg) {
    const key = `${msg.guild.id}_${val}`
    const result = this.cache.get(key)
    this.cache.delete(key)
    return result ?? null
  }
}

function validateAndSet (arg, key, id, username) {
  if (arg.oneOf?.includes(id) ?? true) {
    this.cache.set(key, { id, username })
    return true
  }
  return false
}

function memberFilterExact (search) {
  return member => member.user.username.toLowerCase() === search ||
    (member.nickname && member.nickname.toLowerCase() === search) ||
    `${member.user.username.toLowerCase()}#${member.user.discriminator}` === search
}

module.exports = RobloxUserArgumentType
