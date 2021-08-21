'use strict'

module.exports = (sequelize, DataTypes) => {
  const TicketType = sequelize.define('TicketType', {}, {
    hooks: {
      beforeUpdate: async (ticketType, { channelId }) => {
        if (ticketType.changed('messageId') && ticketType.messageId) {
          await sequelize.models.Message.findOrCreate({
            where: {
              id: ticketType.messageId,
              guildId: ticketType.guildId,
              channelId
            }
          })
        }
        if (ticketType.changed('emojiId') && ticketType.emojiId) {
          await sequelize.models.Emoji.findOrCreate({
            where: {
              id: ticketType.emojiId,
              guildId: ticketType.guildId
            }
          })
        }
      }
    }
  })

  return TicketType
}
