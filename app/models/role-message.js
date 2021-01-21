'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleMessage = sequelize.define('RoleMessage', {
    emoji: DataTypes.STRING(7)
  }, {
    validate: {
      emojiXorEmojiId () {
        if ((this.emoji !== null) !== (this.emojiId !== null)) {
          throw new Error('Only one of emoji and emojiId can be set.')
        }
      }
    },
    tableName: 'role_messages'
  })

  RoleMessage.associate = models => {
    RoleMessage.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    RoleMessage.belongsTo(models.Emoji, {
      foreignKey: 'emojiId',
      onDelete: 'CASCADE'
    })
    RoleMessage.belongsTo(models.Role, {
      foreignKey: {
        name: 'roleId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    RoleMessage.belongsTo(models.Message, {
      foreignKey: {
        name: 'messageId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return RoleMessage
}
