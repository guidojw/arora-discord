'use strict'
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
    tableName: 'channels'
  })

  Channel.associate = models => {
    Channel.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Channel.belongsToMany(models.Group, {
      through: 'channels_groups',
      sourceKey: 'id',
      targetKey: 'id'
    })
    Channel.belongsToMany(models.Channel, {
      through: models.ChannelChannel,
      sourceKey: 'id',
      targetKey: 'id',
      foreignKey: 'fromChannelId',
      otherKey: 'toChannelId',
      as: 'fromLinks'
    })
    Channel.belongsToMany(models.Channel, {
      through: models.ChannelChannel,
      sourceKey: 'id',
      targetKey: 'id',
      foreignKey: 'toChannelId',
      otherKey: 'fromChannelId',
      as: 'toLinks'
    })
    Channel.hasMany(models.Panel, {
      foreignKey: 'channelId'
    })
    Channel.hasMany(models.Message, {
      foreignKey: {
        name: 'channelId',
        allowNull: false
      }
    })
    Channel.hasMany(models.Ticket, {
      foreignKey: 'channelId'
    })
    Channel.hasOne(models.Guild, {
      foreignKey: 'logsChannelId'
    })
    Channel.hasOne(models.Guild, {
      foreignKey: 'suggestionsChannelId'
    })
    Channel.hasOne(models.Guild, {
      foreignKey: 'ratingsChannelId'
    })
    Channel.hasOne(models.Guild, {
      foreignKey: 'ticketsCategoryId'
    })
  }

  return Channel
}
