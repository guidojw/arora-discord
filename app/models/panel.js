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
