'use strict'
const { stripIndents } = require('common-tags')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sequelize's seederStorage doesn't work, so we do it ourselves:
    await queryInterface.createTable('sequelize_data', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    })


    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channels', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      },
      channelId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'channel_id'
      }
    })

    await queryInterface.createTable('members', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      },
    })

    await queryInterface.createTable('emojis', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('panels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.STRING(7000),
        allowNull: false
      },
      messageId: {
        type: Sequelize.BIGINT,
        unique: true,
        references: {
          model: 'messages',
          key: 'id'
        },
        field: 'message_id'
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      },
      channelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'channel_id'
      }
    })

    await queryInterface.createTable('groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['role', 'channel']
      },
      guarded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true
      },
      supportEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'support_enabled'
      },
      primaryColor: {
        type: Sequelize.INTEGER,
        field: 'primary_color'
      },
      commandPrefix: {
        type: Sequelize.STRING,
        field: 'command_prefix'
      },
      robloxGroupId: {
        type: Sequelize.INTEGER,
        field: 'roblox_group_id'
      },
      logsChannelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'logs_channel_id'
      },
      suggestionsChannelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'suggestions_channel_id'
      },
      ratingsChannelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'ratings_channel_id'
      },
      ticketsCategoryId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        field: 'tickets_category_id'
      },
      trainingsInfoPanelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'panels',
          key: 'id'
        },
        field: 'trainings_info_panel_id'
      },
      trainingsPanelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'panels',
          key: 'id'
        },
        field: 'trainings_panel_id'
      }
    })

    await Promise.all([
      addGuildIDConstraint(queryInterface, 'roles'),
      addGuildIDConstraint(queryInterface, 'channels'),
      addGuildIDConstraint(queryInterface, 'messages'),
      addGuildIDConstraint(queryInterface, 'members'),
      addGuildIDConstraint(queryInterface, 'emojis'),
      addGuildIDConstraint(queryInterface, 'panels'),
      addGuildIDConstraint(queryInterface, 'groups')
    ])

    await queryInterface.createTable('commands', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'commands_name_type_guild_id_key'
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        unique: 'commands_name_type_guild_id_key',
        values: ['command', 'group']
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: 'commands_name_type_guild_id_key',
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })
    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: {
        type: Sequelize.STRING(7000),
        allowNull: false
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('tag_names', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'tag_id'
      }
    })

    await queryInterface.createTable('ticket_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: 'ticket_types_name_guild_id_key'
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: 'ticket_types_name_guild_id_key',
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      emoji: Sequelize.STRING,
      emojiId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'emojis',
          key: 'id'
        },
        field: 'emoji_id'
      },
      panelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'panels',
          key: 'id'
        },
        field: 'panel_id'
      }
    })

    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ticket_types',
          key: 'id'
        },
        field: 'type_id'
      },
      authorId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'author_id'
      },
      channelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'channel_id'
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await addExclusiveBelongsToConstraint(queryInterface, 'ticket_types', ['emoji', 'emoji_id'])

    await queryInterface.createTable('tickets_moderators', {
      ticketId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tickets',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'ticket_id'
      },
      memberId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'member_id'
      }
    })

    await queryInterface.createTable('members_roles', {
      memberId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'member_id'
      },
      roleId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_id'
      },
      guildId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('role_bindings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      min: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      max: Sequelize.INTEGER,
      roleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        field: 'role_id'
      },
      robloxGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'roblox_group_id'
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('role_messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      emoji: Sequelize.STRING,
      emojiId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'emojis',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'emoji_id'
      },
      roleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_id'
      },
      messageId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'message_id'
      },
      guildId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await addExclusiveBelongsToConstraint(queryInterface, 'role_messages', ['emoji', 'emoji_id'])

    await queryInterface.createTable('channels_channels', {
      from_channel_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'from_channel_id'
      },
      to_channel_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'to_channel_id'
      }
    })

    await queryInterface.createTable('channels_groups', {
      channelId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'channel_id'
      },
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references:  {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'group_id'
      }
    })

    await queryInterface.createTable('roles_groups', {
      roleId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_id'
      },
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'group_id'
      }
    })

    await queryInterface.createTable('permissions', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    })

    await queryInterface.createTable('groups_permissions', {
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'group_id'
      },
      permissionName: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'permissions',
          key: 'name'
        },
        onDelete: 'CASCADE',
        field: 'permission_name'
      }
    })

    await queryInterface.createTable('roles_permissions', {
      roleId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_id'
      },
      permissionName: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'permissions',
          key: 'name'
        },
        onDelete: 'CASCADE',
        field: 'permission_name'
      }
    })

    await queryInterface.createTable('permission_overwrites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      allow: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      permissionName: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'name'
        },
        onDelete: 'CASCADE',
        field: 'permission_name'
      },
      roleId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'role_id'
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'group_id'
      }
    }, {
      indexes: [{
        unique: true,
        fields: ['permission_name', 'role_id']
      }, {
        unique: true,
        fields: ['permission_name', 'group_id']
      }]
    })

    await addExclusiveBelongsToConstraint(
      queryInterface,
      'permission_overwrites',
      ['role_id', 'group_id']
    )
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('permission_overwrites')

    await queryInterface.dropTable('roles_permissions')
    await queryInterface.dropTable('groups_permissions')
    await queryInterface.dropTable('permissions')

    await queryInterface.dropTable('roles_groups')
    await queryInterface.dropTable('channels_groups')

    await queryInterface.dropTable('channels_channels')

    await queryInterface.dropTable('role_messages')
    await queryInterface.dropTable('role_bindings')

    await queryInterface.dropTable('members_roles')

    await queryInterface.dropTable('tickets_moderators')
    await queryInterface.dropTable('tickets')
    await queryInterface.dropTable('ticket_types')

    await queryInterface.dropTable('tag_names')
    await queryInterface.dropTable('tags')

    await queryInterface.dropTable('commands')

    await Promise.all([
      queryInterface.removeConstraint('groups', 'groups_guild_id_guilds_fk'),
      queryInterface.removeConstraint('panels', 'panels_guild_id_guilds_fk'),
      queryInterface.removeConstraint('emojis', 'emojis_guild_id_guilds_fk'),
      queryInterface.removeConstraint('members', 'members_guild_id_guilds_fk'),
      queryInterface.removeConstraint('messages', 'messages_guild_id_guilds_fk'),
      queryInterface.removeConstraint('channels', 'channels_guild_id_guilds_fk'),
      queryInterface.removeConstraint('roles', 'roles_guild_id_guilds_fk')
    ])

    await queryInterface.dropTable('guilds')
    await queryInterface.dropTable('groups')
    await queryInterface.dropTable('panels')
    await queryInterface.dropTable('emojis')
    await queryInterface.dropTable('members')
    await queryInterface.dropTable('messages')
    await queryInterface.dropTable('channels')
    await queryInterface.dropTable('roles')

    await queryInterface.dropTable('sequelize_data')
  }
}

function addGuildIDConstraint (queryInterface, tableName) {
  return queryInterface.addConstraint(tableName, {
    fields: ['guild_id'],
    type: 'foreign key',
    name: `${tableName}_guild_id_guilds_fk`,
    references: {
      table: 'guilds',
      field: 'id'
    },
    onDelete: 'CASCADE'
  })
}

function addExclusiveBelongsToConstraint (queryInterface, tableName, columns) {
  return queryInterface.sequelize.query(stripIndents`
  ALTER TABLE ${tableName}
  ADD CONSTRAINT ${tableName}_${columns.join('_')}_check
  CHECK (
    (
      ${columns.map(column => `(${column} IS NOT NULL)::INTEGER`).join(' +\n')}
    ) = 1
  );
  `)
}
