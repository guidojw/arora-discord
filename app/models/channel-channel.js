'use strict'
module.exports = sequelize => {
  const ChannelChannel = sequelize.define('ChannelChannel', {}, {
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
