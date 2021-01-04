'use strict'
module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define('Guild', {
    id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
      field: 'logs_channel_id'
    },
    trainingsChannelId: {
      type: DataTypes.BIGINT,
      field: 'trainings_channel_id'
    },
    suggestionsChannelId: {
      type: DataTypes.BIGINT,
      field: 'suggestions_channel_id'
    },
    ratingsChannelId: {
      type: DataTypes.BIGINT,
      field: 'ratings_channel_id'
    },
    supportChannelId: {
      type: DataTypes.BIGINT,
      field: 'support_channel_id'
    },
    welcomeChannelId: {
      type: DataTypes.BIGINT,
      field: 'welcome_channel_id'
    },
    ticketsCategoryId: {
      type: DataTypes.BIGINT,
      field: 'tickets_category_id'
    },
    trainingsMessageId: {
      type: DataTypes.BIGINT,
      field: 'trainings_message_id'
    },
    trainingsInfoMessageId: {
      type: DataTypes.BIGINT,
      field: 'trainings_info_message_id'
    },
    supportMessageId: {
      type: DataTypes.BIGINT,
      field: 'support_message_id'
    }
  }, {
    hooks: {
      afterCreate: async guild => {
        await guild.createRole({ id: guild.id, guildId: guild.id })

        await guild.createGroup({ name: 'serverBoosterReportChannels', type: 'channel', guarded: true })
        await guild.createGroup({ name: 'photoContestChannels', type: 'channel', guarded: true })
        await guild.createGroup({ name: 'noTextChannels', type: 'channel', guarded: true })

        const adminRoleGroup = await guild.createGroup({ name: 'admin', type: 'role', guarded: true })
        const everyoneRoleGroup = await guild.createGroup({ name: 'everyone', type: 'role', guarded: true })
        // await sequelize.models.GroupPermission.bulkCreate([])
        // await sequelize.models.GroupPermission.bulkCreate([])
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
      },
      as: 'groups'
    })
    Guild.hasMany(models.Role, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'roles'
    })
  }

  Guild.loadScopes = models => {
    Guild.addScope('defaultScope', {
      include: [{
        model: models.Group,
        as: 'groups'
      }, {
        model: models.Role,
        as: 'roles'
      }],
      subQuery: false
    })
  }

  return Guild
}
