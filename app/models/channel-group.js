'use strict'
module.exports = (sequelize, DataTypes) => {
  const ChannelGroup = sequelize.define('ChannelGroup', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'channel_groups'
  })

  ChannelGroup.associate = models => {
    ChannelGroup.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    ChannelGroup.hasMany(models.ChannelChannelGroup, {
      foreignKey: {
        name: 'channelGroupId',
        primaryKey: true
      }
    })
  }

  return ChannelGroup
}
