'use strict'
module.exports = (sequelize, DataTypes) => {
  const ChannelGroup = sequelize.define('ChannelGroup', {
    channelId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: 'channel_id'
    }
  }, {
    tableName: 'channels_groups'
  })

  ChannelGroup.associate = models => {
    ChannelGroup.belongsTo(models.Group, {
      foreignKey: {
        name: 'groupId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return ChannelGroup
}
