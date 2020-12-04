'use strict'
module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define('Guild', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    primaryColor: {
      type: DataTypes.INTEGER,
      field: 'primary_color'
    },
    supportEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'support_enabled'
    },
    robloxGroupId: {
      type: DataTypes.INTEGER,
      field: 'roblox_group_id'
    },
    logsChannelId: {
      type: DataTypes.STRING,
      field: 'log_channel_id'
    },
    trainingsChannelId: {
      type: DataTypes.STRING,
      field: 'trainings_channel_id'
    },
    suggestionsChannelId: {
      type: DataTypes.STRING,
      field: 'suggestions_channel_id'
    },
    ratingsChannelId: {
      type: DataTypes.STRING,
      field: 'ratings_channel_id'
    },
    supportChannelId: {
      type: DataTypes.STRING,
      field: 'support_channel_id'
    },
    trainingsMessageId: {
      type: DataTypes.STRING,
      field: 'trainings_message_id'
    },
    trainingsIngfoMessageId: {
      type: DataTypes.STRING,
      field: 'trainings_info_message_id'
    },
    supportMessageId: {
      type: DataTypes.STRING,
      field: 'support_message_id'
    }
  }, {
    tableName: 'guilds'
  })

  Guild.associate = models => {
    Guild.hasMany(models.GuildCommand, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      }
    })
    Guild.hasMany(models.Tag, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.Ticket, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.RoleBinding, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.UserRole, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      }
    })
    Guild.hasMany(models.ChannelChannel, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      }
    })
    Guild.hasMany(models.Group, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
  }

  return Guild
}
