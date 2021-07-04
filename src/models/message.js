'use strict'

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {}, {
    hooks: {
      beforeCreate: message => {
        return sequelize.models.Channel.findOrCreate({
          where: {
            id: message.channelId,
            guildId: message.guildId
          }
        })
      }
    },
    tableName: 'messages'
  })

  return Message
}
