'use strict'
module.exports = (sequelize, DataTypes) => {
  const TicketType = sequelize.define('TicketType', {
    name: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: 'ticket_types_name_guild_id_key'
    },
    emoji: {
      type: DataTypes.STRING(7),
      defaultValue: null
    }
  }, {
    validate: {
      emojiNandEmojiId () {
        if (this.emoji !== null && this.emojiId !== null) {
          throw new Error('Only one of emoji and emojiId can be set.')
        }
      }
    },
    tableName: 'ticket_types'
  })

  TicketType.associate = models => {
    TicketType.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false,
        unique: 'ticket_types_name_guild_id_key'
      },
      onDelete: 'CASCADE'
    })
    TicketType.belongsTo(models.Emoji, {
      foreignKey: {
        name: 'emojiId',
        defaultValue: null
      }
    })
    TicketType.belongsTo(models.Panel, {
      foreignKey: 'panelId'
    })
    TicketType.hasMany(models.Ticket, {
      foreignKey: {
        name: 'typeId',
        allowNull: false
      }
    })
  }

  return TicketType
}
