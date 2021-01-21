'use strict'
module.exports = (sequelize, DataTypes) => {
  const Emoji = sequelize.define('Emoji', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  }, {
    tableName: 'emojis'
  })

  Emoji.associate = models => {
    Emoji.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Emoji.hasMany(models.TicketType, {
      foreignKey: 'emojiId'
    })
    Emoji.hasMany(models.RoleMessage, {
      foreignKey: 'emojiId'
    })
  }

  return Emoji
}
