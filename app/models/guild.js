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
    },
    verificationPreference: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['rover', 'bloxlink'],
      defaultValue: 'rover',
      field: 'verification_preference'
    }
  }, {
    tableName: 'guilds'
  })

  Guild.associate = models => {
    Guild.belongsToMany(models.Command, {
      through: models.GuildCommand,
      foreignKey: 'guildId',
      otherKey: 'commandId'
    })
    Guild.hasMany(models.Tag, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'tags'
    })
    Guild.hasMany(models.Ticket, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'tickets'
    })
    Guild.hasMany(models.RoleBinding, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'roleBindings'
    })
    Guild.hasMany(models.RoleMessage, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      as: 'roleMessages'
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
      },
      as: 'ticketTypes'
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
        model: models.Panel,
        as: 'panels'
      }, {
        model: models.RoleMessage,
        as: 'roleMessages'
      }, {
        model: models.Tag,
        as: 'tags'
      }, {
        model: models.Ticket,
        as: 'tickets'
      }, {
        model: models.TicketType,
        as: 'ticketTypes'
      }]
    })
    Guild.addScope('withRoleBindings', {
      include: [{
        model: models.RoleBinding,
        as: 'roleBindings'
      }]
    })
  }

  return Guild
}
