'use strict'
module.exports = (sequelize, DataTypes) => {
  const ChannelChannel = sequelize.define('ChannelChannel', {
    channel1Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'channel1_id'
    },
    channel2Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'channel2_id'
    }
  }, {
    tableName: 'channels_channels'
  })

  ChannelChannel.associate = models => {
    ChannelChannel.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return ChannelChannel
}
