'use strict'
module.exports = (sequelize, DataTypes) => {
  const ChannelChannelGroup = sequelize.define('ChannelChannelGroup', {
    channelId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'channel_id'
    }
  }, {
    tableName: 'channels_channel_groups'
  })

  ChannelChannelGroup.associate = models => {
    ChannelChannelGroup.belongsTo(models.ChannelGroup, {
      foreignKey: {
        name: 'channelGroupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return ChannelChannelGroup
}
