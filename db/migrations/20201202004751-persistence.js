'use strict'
const { stripIndents } = require('common-tags')

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
    await Promise.all([
      queryInterface.createTable('roles', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true
        },
        guildId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          field: 'guild_id'
        }
      }),
      queryInterface.createTable('members', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          field: 'user_id'
        },
        guildId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          field: 'guild_id'
        }
      }),
      queryInterface.createTable('emojis', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true
        },
        guildId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          field: 'guild_id'
        }
      }),
      queryInterface.createTable('panels', {
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
        }
      }),
      queryInterface.createTable('groups', {
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
    ])
    await Promise.all([
      queryInterface.addIndex('members', ['guild_id', 'user_id'], { unique: true }),
      queryInterface.addIndex('panels', ['guild_id', 'name'], { unique: true }),
      queryInterface.addIndex('groups', ['guild_id', 'name'], { unique: true })
    ])

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
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['command', 'group']
      }
    })
    await queryInterface.addIndex('commands', ['name', 'type'], { unique: true })

    await queryInterface.createTable('guilds_commands', {
      guildId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      commandId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'commands',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'command_id'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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
      messageId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'messages',
          key: 'id'
        },
        field: 'message_id'
      }
    })
    await queryInterface.addIndex('ticket_types', ['guild_id', 'name'], { unique: true })

    await addExclusiveArcOrNoneConstraint(queryInterface, 'ticket_types', ['emoji', 'emoji_id'])

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
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex(
      'tickets',
      ['channel_id', 'guild_id'],
      { unique: true, where: { channel_id: { [Sequelize.Op.ne]: null } } }
    )

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
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'member_id'
      }
    })

    await Promise.all([
      queryInterface.createTable('members_roles', {
        memberId: {
          type: Sequelize.INTEGER,
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
        }
      }),
      queryInterface.createTable('role_bindings', {
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
      }),
      queryInterface.createTable('role_messages', {
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
    ])
    await Promise.all([
      queryInterface.addIndex(
        'role_bindings',
        ['guild_id', 'max', 'min', 'roblox_group_id', 'role_id'],
        { unique: true }
      ),
      queryInterface.addIndex(
        'role_bindings',
        ['guild_id', 'min', 'roblox_group_id', 'role_id'],
        { unique: true, where: { max: null } }
      ),
      queryInterface.addIndex(
        'role_messages',
        ['emoji', 'emoji_id', 'guild_id', 'message_id', 'role_id'],
        { unique: true }
      ),
      queryInterface.addIndex(
        'role_messages',
        ['emoji', 'guild_id', 'message_id', 'role_id'],
        { unique: true, where: { emoji_id: null } }
      ),
      queryInterface.addIndex(
        'role_messages',
        ['emoji_id', 'guild_id', 'message_id', 'role_id'],
        { unique: true, where: { emoji: null } }
      )
    ])

    await addExclusiveArcConstraint(queryInterface, 'role_messages', ['emoji', 'emoji_id'])

    await Promise.all([
      queryInterface.createTable('channels_channels', {
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
      }),
      queryInterface.createTable('channels_groups', {
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
      }),
      queryInterface.createTable('roles_groups', {
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
    ])

    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      allow: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      commandId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'commands',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'command_id'
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
        fields: ['command_id', 'group_id']
      }, {
        unique: true,
        fields: ['command_id', 'role_id']
      }]
    })
    await Promise.all([
      queryInterface.addIndex('permissions', ['command_id', 'group_id', 'role_id'], { unique: true }),
      queryInterface.addIndex('permissions', ['command_id', 'group_id'], { unique: true, where: { role_id: null } }),
      queryInterface.addIndex('permissions', ['command_id', 'role_id'], { unique: true, where: { group_id: null } })
    ])

    await addExclusiveArcConstraint(queryInterface, 'permissions', ['role_id', 'group_id'])
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('permissions')

    await Promise.all([
      queryInterface.dropTable('roles_groups'),
      queryInterface.dropTable('channels_groups'),
      queryInterface.dropTable('channels_channels')
    ])

    await Promise.all([
      queryInterface.dropTable('role_messages'),
      queryInterface.dropTable('role_bindings'),
      queryInterface.dropTable('members_roles')
    ])

    await queryInterface.dropTable('tickets_moderators')
    await queryInterface.dropTable('tickets')

    await queryInterface.dropTable('ticket_types')

    await queryInterface.dropTable('tag_names')
    await queryInterface.dropTable('tags')

    await queryInterface.dropTable('guilds_commands')
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

    await Promise.all([
      queryInterface.dropTable('groups'),
      queryInterface.dropTable('panels'),
      queryInterface.dropTable('emojis'),
      queryInterface.dropTable('members'),
      queryInterface.dropTable('roles')
    ])
    await queryInterface.dropTable('messages')
    await queryInterface.dropTable('channels')
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

function addExclusiveArcConstraint (queryInterface, tableName, columns) {
  return addCardinalityConstraint(queryInterface, tableName, columns, '= 1')
}

function addExclusiveArcOrNoneConstraint (queryInterface, tableName, columns) {
  return addCardinalityConstraint(queryInterface, tableName, columns, '<= 1')
}

function addCardinalityConstraint (queryInterface, tableName, columns, condition) {
  return queryInterface.sequelize.query(stripIndents`
  ALTER TABLE ${tableName}
  ADD CONSTRAINT ${tableName}_${columns.join('_')}_check
  CHECK (
    (
      ${columns.map(column => `(${column} IS NOT NULL)::INTEGER`).join(' +\n')}
    ) ${condition}
  );
  `)
}
