'use strict'
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
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
  }

  return Message
}
