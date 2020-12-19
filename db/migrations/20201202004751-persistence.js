'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sequelize's seederStorage doesn't work, so we do it ourselves:
    await queryInterface.createTable('sequelize_data', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    })

    await queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      primaryColor: {
        type: Sequelize.INTEGER,
        field: 'primary_color'
      },
      commandPrefix: {
        type: Sequelize.STRING,
        field: 'command_prefix'
      },
      supportEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'support_enabled'
      },
      robloxGroupId: {
        type: Sequelize.INTEGER,
        field: 'roblox_group_id'
      },
      logsChannelId: {
        type: Sequelize.STRING,
        field: 'logs_channel_id'
      },
      trainingsChannelId: {
        type: Sequelize.STRING,
        field: 'trainings_channel_id'
      },
      suggestionsChannelId: {
        type: Sequelize.STRING,
        field: 'suggestions_channel_id'
      },
      ratingsChannelId: {
        type: Sequelize.STRING,
        field: 'ratings_channel_id'
      },
      supportChannelId: {
        type: Sequelize.STRING,
        field: 'support_channel_id'
      },
      welcomeChannelId: {
        type: Sequelize.STRING,
        field: 'welcome_channel_id'
      },
      ticketsCategoryId: {
        type: Sequelize.STRING,
        field: 'tickets_category_id'
      },
      trainingsMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_message_id'
      },
      trainingsInfoMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_info_message_id'
      },
      supportMessageId: {
        type: Sequelize.STRING,
        field: 'support_message_id'
      }
    })

    await queryInterface.createTable('guilds_commands', {
      commandName: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'command_name'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    })

    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'author_id'
      },
      content: {
        type: Sequelize.STRING(7000),
        allowNull: false
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

    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'author_id'
      },
      channelId: {
        type: Sequelize.STRING,
        field: 'channel_id'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      }
    })

    await queryInterface.createTable('tickets_moderators', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'user_id'
      },
      ticketId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tickets',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'ticket_id'
      }
    })

    await queryInterface.createTable('role_bindings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'role_id'
      },
      robloxGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'roblox_group_id'
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      min: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      max: Sequelize.INTEGER
    })

    await queryInterface.createTable('users_roles', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'user_id'
      },
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'role_id'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
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
      emojiId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'emoji_id'
      },
      roleId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'role_id'
      },
      messageId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'message_id'
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channels_channels', {
      channel1_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel1_id'
      },
      channel2_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel2_id'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
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
      guildId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      }
    })

    await queryInterface.createTable('channels_groups', {
      channelId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'channel_id'
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

    await queryInterface.createTable('roles_groups', {
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true,
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
          key: 'name',
        },
        onDelete: 'CASCADE',
        field: 'permission_name'
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['allow', 'deny'],
        defaultValue: 'allow'
      }
    })

    await queryInterface.createTable('roles_permissions', {
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true,
        field: 'role_id'
      },
      permissionName: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'permissions',
          key: 'name',
        },
        onDelete: 'CASCADE',
        field: 'permission_name'
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['allow', 'deny'],
        defaultValue: 'allow'
      }
    })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('roles_permissions')
    await queryInterface.dropTable('groups_permissions')
    await queryInterface.dropTable('permissions')

    await queryInterface.dropTable('roles_groups')
    await queryInterface.dropTable('channels_groups')
    await queryInterface.dropTable('groups')

    await queryInterface.dropTable('channels_channels')

    await queryInterface.dropTable('roles_messages')
    await queryInterface.dropTable('users_roles')
    await queryInterface.dropTable('role_bindings')

    await queryInterface.dropTable('tickets_moderators')
    await queryInterface.dropTable('tickets')

    await queryInterface.dropTable('tag_names')
    await queryInterface.dropTable('tags')

    await queryInterface.dropTable('guilds_commands')
    await queryInterface.dropTable('guilds')

    await queryInterface.dropTable('sequelize_data')
  }
}
