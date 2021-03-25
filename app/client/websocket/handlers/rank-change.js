'use strict'
const { discordService, userService } = require('../../../services')

const rankChangeHandler = async (client, { data }) => {
  const { groupId, userId, rank } = data.args
  let username
  for (const guild of client.guilds.cache.values()) {
    if (guild.robloxGroupId === groupId) {
      if (!username) {
        username = (await userService.getUser(userId)).name
      }
      const member = await discordService.getMemberByName(guild, username)

      if (member) {
        for (const roleBinding of guild.roleBindings.cache.values()) {
          if (rank === roleBinding.min || (roleBinding.max && rank >= roleBinding.min && rank <= roleBinding.max)) {
            member.roles.add(roleBinding.roleId)
          } else {
            member.roles.remove(roleBinding.roleId)
          }
        }
      }
    }
  }
}

module.exports = rankChangeHandler
