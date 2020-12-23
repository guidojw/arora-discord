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
    commandPrefix: {
      type: DataTypes.STRING,
      fied: 'command_prefix'
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
      field: 'logs_channel_id'
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
    welcomeChannelId: {
      type: DataTypes.STRING,
      field: 'welcome_channel_id'
    },
    ticketsCategoryId: {
      type: DataTypes.STRING,
      field: 'tickets_category_id'
    },
    trainingsMessageId: {
      type: DataTypes.STRING,
      field: 'trainings_message_id'
    },
    trainingsInfoMessageId: {
      type: DataTypes.STRING,
      field: 'trainings_info_message_id'
    },
    supportMessageId: {
      type: DataTypes.STRING,
      field: 'support_message_id'
    }
  }, {
    hooks: {
      afterCreate: async guild => {
        await guild.createGroup({ name: 'premiumMembersReportChannels', type: 'channel' })

        await guild.createGroup({ name: 'admin', type: 'role' })
        await guild.createGroup({ name: 'everyone', type: 'role' })
      }
    },
    tableName: 'guilds'
  })

  Guild.associate = models => {
    Guild.hasMany(models.GuildCommand, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      as: 'commands'
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
    Guild.hasMany(models.RoleMessage, {
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
