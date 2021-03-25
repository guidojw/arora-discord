'use strict'
module.exports = (sequelize, DataTypes) => {
  const RoleMessage = sequelize.define('RoleMessage', {
    emoji: {
      type: DataTypes.STRING(7),
      validate: { emojiXorEmojiId }
    }
  }, {
    hooks: {
      beforeCreate: (roleMessage, { channelId }) => {
        return Promise.all([
          sequelize.models.Role.findOrCreate({
            where: {
              id: roleMessage.roleId,
              guildId: roleMessage.guildId
            }
          }),
          sequelize.models.Message.findOrCreate({
            where: {
              id: roleMessage.messageId,
              guildId: roleMessage.guildId,
              channelId
            }
          }),
          roleMessage.emojiId && sequelize.models.Emoji.findOrCreate({
            where: {
              id: roleMessage.emojiId,
              guildId: roleMessage.guildId
            }
          })
        ])
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
      foreignKey: {
        name: 'emojiId',
        validate: { emojiXorEmojiId }
      },
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
      as: 'message',
      onDelete: 'CASCADE'
    })
  }

  RoleMessage.loadScopes = models => {
    RoleMessage.addScope('defaultScope', {
      include: [{
        model: models.Message,
        as: 'message'
      }]
    })
  }

  return RoleMessage
}

function emojiXorEmojiId () {
  if ((this.emoji === null) === (this.emojiId === null)) {
    throw new Error('Only one of emoji and emojiId can be set.')
  }
}
