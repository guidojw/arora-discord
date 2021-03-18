'use strict'
module.exports = (sequelize, DataTypes) => {
  const Panel = sequelize.define('Panel', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(7000), // 6000 for embed character limit + 1000 margin for JSON characters
      allowNull: false
    }
  }, {
    hooks: {
      beforeUpdate: async panel => {
        if (panel.changed('channelId') && panel.channelId) {
          await sequelize.models.Channel.findOrCreate({
            where: {
              id: panel.channelId,
              guildId: panel.guildId
            }
          })
        }
        if (panel.changed('messageId') && panel.messageId) {
          await sequelize.models.Message.findOrCreate({
            where: {
              id: panel.messageId,
              channelId: panel.channelId,
              guildId: panel.guildId
            }
          })
        }
      }
    },
    tableName: 'panels'
  })

  Panel.associate = models => {
    Panel.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Panel.belongsTo(models.Message, {
      foreignKey: 'messageId',
      unique: true
    })
    Panel.belongsTo(models.Channel, {
      foreignKey: 'channelId'
    })
    Panel.hasOne(models.Guild, {
      foreignKey: 'trainingsInfoPanelId'
    })
    Panel.hasOne(models.Guild, {
      foreignKey: 'trainingsPanelId'
    })
    Panel.hasOne(models.TicketType, {
      foreignKey: 'panelId'
    })
  }

  return Panel
}
