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
      unique: true,
      as: 'message'
    })
    Panel.hasOne(models.Guild, {
      foreignKey: 'trainingsInfoPanelId'
    })
    Panel.hasOne(models.Guild, {
      foreignKey: 'trainingsPanelId'
    })
  }

  Panel.loadScopes = models => {
    Panel.addScope('defaultScope', {
      include: [{
        model: models.Message,
        as: 'message'
      }]
    })
  }

  return Panel
}
