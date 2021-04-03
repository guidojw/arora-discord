'use strict'

const { userService } = require('../../../services')

const rankChangeHandler = async (client, { data }) => {
  const { groupId, userId, rank } = data
  let usernameRegex
  let errored = false
  for (const guild of client.guilds.cache.values()) {
    if (guild.robloxGroupId === groupId) {
      const roleBindings = await guild.roleBindings.fetch()
      if (roleBindings.size > 0) {
        let userMembers
        if (guild.robloxUsernamesInNicknames && !errored) {
          if (!usernameRegex) {
            try {
              const username = (await userService.getUser(userId)).name
              usernameRegex = new RegExp(`(?:^|\\s+)(${username})(?:$|\\s+)`)
            } catch {
              errored = true
            }
          }

          if (!errored) {
            const members = await guild.members.fetch()
            userMembers = members.filter(member => usernameRegex.test(member.displayName))
          }
        }
        if (!userMembers) {
          userMembers = guild.members.cache.filter(member => member.robloxId === userId)
        }

        if (userMembers.size > 0) {
          for (const roleBinding of roleBindings.values()) {
            if (rank === roleBinding.min || (roleBinding.max && rank >= roleBinding.min && rank <= roleBinding.max)) {
              userMembers.forEach(member => member.roles.add(roleBinding.roleId))
            } else {
              userMembers.forEach(member => member.roles.remove(roleBinding.roleId))
            }
          }
        }
      }
    }
  }
}

module.exports = rankChangeHandler
