'use strict'
const discordService = require('../../../services/discord')
const userService = require('../../../services/user')

const { Events } = require('../../../util/constants')
const { RoleBinding } = require('../../../models')

const rankChangeHandler = async (client, { data }) => {
  const { groupId, userId, rank } = data.args
  let username
  for (const guild of client.guilds.cache.values()) {
    if (guild.groupId === groupId) {
      if (!username) {
        username = (await userService.getUser(userId)).name
      }
      const member = await discordService.getMemberByName(guild, username)

      if (member) {
        const roleBindings = await RoleBinding.findAll({ where: { guildId: guild.id, robloxGroupId: groupId } })
        for (const roleBinding of roleBindings) {
          if (rank === roleBinding.min || (roleBinding.max && rank >= roleBinding.min && rank <= roleBinding.max)) {
            await member.roles.add(roleBinding.roleId)
          } else {
            await member.roles.remove(roleBinding.roleId)
          }
        }
      }
    }
  }

  client.emit(Events.RANK_CHANGE, ...data.args)
}

module.exports = rankChangeHandler
