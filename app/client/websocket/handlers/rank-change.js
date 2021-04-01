'use strict'

const { userService } = require('../../../services')

const rankChangeHandler = async (client, { data }) => {
  const { groupId, userId, rank } = data.args
  let username
  let errored = false
  for (const guild of client.guilds.cache.values()) {
    if (guild.robloxGroupId === groupId) {
      const roleBindings = await guild.roleBindings.fetch()
      if (roleBindings.size > 0) {
        let userMembers
        if (guild.robloxUsernamesAsNicknames && !errored) {
          if (!username) {
            try {
              username = (await userService.getUser(userId)).name.toLowerCase()
            } catch {
              errored = true
            }
          }
          const members = await guild.members.fetch()

          userMembers = members.filter(member => member.displayName.toLowerCase() === username)
        } else {
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
