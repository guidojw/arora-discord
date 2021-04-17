'use strict'

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
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

  Message.associate = models => {
    Message.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Message.belongsTo(models.Channel, {
      foreignKey: 'channelId',
      allowNull: false,
      onDelete: 'CASCADE'
    })
    Message.hasMany(models.Panel, {
      foreignKey: 'messageId'
    })
    Message.hasMany(models.TicketType, {
      foreignKey: 'messageId'
    })
  }

  return Message
}
