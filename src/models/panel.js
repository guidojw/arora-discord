'use strict'

module.exports = (sequelize, DataTypes) => {
  const Panel = sequelize.define('Panel', {}, {
    hooks: {
      beforeUpdate: (panel, { channelId }) => {
        if (panel.changed('messageId') && panel.messageId) {
          return sequelize.models.Message.findOrCreate({
            where: {
              id: panel.messageId,
              channelId: channelId,
              guildId: panel.guildId
            }
          })
        }
      }
    }
  })

  return Panel
}
