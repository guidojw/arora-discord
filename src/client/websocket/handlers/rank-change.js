'use strict'

const { userService } = require('../../../services')

const rankChangeHandler = async (client, { data }) => {
  const { groupId, userId, rank } = data
  const username = (await userService.getUser(userId)).name
  for (const guild of client.guilds.cache.values()) {
    if (guild.robloxGroupId === groupId) {
      const roleBindings = await guild.roleBindings.fetch()
      if (roleBindings.size > 0) {
        const members = await guild.members.fetch(username)
        if (members.size > 0) {
          for (const roleBinding of roleBindings.values()) {
            if (rank === roleBinding.min || (roleBinding.max && rank >= roleBinding.min && rank <= roleBinding.max)) {
              members.forEach(member => member.roles.add(roleBinding.roleId))
            } else {
              members.forEach(member => member.roles.remove(roleBinding.roleId))
            }
          }
        }
      }
    }
  }
}

module.exports = rankChangeHandler
