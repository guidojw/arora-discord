'use strict'
const guildMemberUpdateHandler = async (client, oldMember, newMember) => {
  if (newMember.user.bot) {
    return
  }

  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    const removedRole = oldMember.roles.cache.find(role => !newMember.roles.cache.has(role.id))
    const persistentRoles = await newMember.fetchPersistentRoles()
    if (persistentRoles.has(removedRole.id)) {
      return newMember.unpersistRole(removedRole)
    }
  }
}

module.exports = guildMemberUpdateHandler
