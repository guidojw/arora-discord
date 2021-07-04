'use strict'

module.exports = (sequelize, DataTypes) => {
  const RoleMessage = sequelize.define('RoleMessage', {}, {
    hooks: {
      beforeCreate: (roleMessage, { channelId }) => {
        return Promise.all([
          sequelize.models.Role.findOrCreate({
            where: {
              id: roleMessage.roleId,
              guildId: roleMessage.guildId
            }
          }),
          sequelize.models.Message.findOrCreate({
            where: {
              id: roleMessage.messageId,
              guildId: roleMessage.guildId,
              channelId
            }
          }),
          roleMessage.emojiId && sequelize.models.Emoji.findOrCreate({
            where: {
              id: roleMessage.emojiId,
              guildId: roleMessage.guildId
            }
          })
        ])
      }
    },
    tableName: 'role_messages'
  })

  RoleMessage.loadScopes = models => {
    RoleMessage.addScope('defaultScope', {
      include: [{
        model: models.Message,
        as: 'message'
      }]
    })
  }

  return RoleMessage
}
