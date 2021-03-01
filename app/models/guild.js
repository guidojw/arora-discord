'use strict'
module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define('Guild', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    supportEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'support_enabled'
    },
    primaryColor: {
      type: DataTypes.INTEGER,
      field: 'primary_color'
    },
    commandPrefix: {
      type: DataTypes.STRING,
      fied: 'command_prefix'
    },
    robloxGroupId: {
      type: DataTypes.INTEGER,
      field: 'roblox_group_id'
    }
  }, {
    hooks: {
      afterCreate: async (guild, { transaction }) => {
        await guild.createRole({
          id: guild.id,
          guildId: guild.id
        }, {
          transaction
        })

        await sequelize.models.Group.bulkCreate([{
          name: 'serverBoosterReportChannels',
          type: 'channel',
          guarded: true,
          guildId: guild.id
        }, {
          name: 'photoContestChannels',
          type: 'channel',
          guarded: true,
          guildId: guild.id
        }, {
          name: 'noTextChannels',
          type: 'channel',
          guarded: true,
          guildId: guild.id
        }, {
          name: 'admin',
          type: 'role',
          guarded: true,
          guildId: guild.id
        }, {
          name: 'everyone',
          type: 'role',
          guarded: true,
          guildId: guild.id
        }], {
          transaction
        })

        // await sequelize.models.GroupPermission.bulkCreate([])
        // await sequelize.models.GroupPermission.bulkCreate([])
      }
    },
    tableName: 'guilds'
  })

  Guild.associate = models => {
    Guild.hasMany(models.Command, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
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
    Guild.hasMany(models.MemberRole, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      }
    })
    Guild.hasMany(models.RoleMessage, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
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
    Guild.hasMany(models.Panel, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'panels'
    })
    Guild.belongsTo(models.Panel, {
      foreignKey: 'trainingsInfoPanelId'
    })
    Guild.belongsTo(models.Panel, {
      foreignKey: 'trainingsPanelId'
    })
    Guild.hasMany(models.Channel, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'channels'
    })
    Guild.belongsTo(models.Channel, {
      foreignKey: 'logsChannelId'
    })
    Guild.belongsTo(models.Channel, {
      foreignKey: 'suggestionsChannelId'
    })
    Guild.belongsTo(models.Channel, {
      foreignKey: 'ratingsChannelId'
    })
    Guild.belongsTo(models.Channel, {
      foreignKey: 'ticketsCategoryId'
    })
    Guild.hasMany(models.TicketType, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.Emoji, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.Message, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
    })
    Guild.hasMany(models.Member, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      }
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
      }, {
        model: models.Channel,
        as: 'channels'
      }, {
        model: models.Panel,
        as: 'panels'
      }],
      subQuery: false
    })
  }

  return Guild
}
