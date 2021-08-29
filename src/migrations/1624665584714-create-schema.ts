import type { MigrationInterface, QueryRunner } from 'typeorm'
import { Table, TableCheck, TableForeignKey } from 'typeorm'

export class createSchema1624665584714 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver

    const sequelizeMigrationTable = await queryRunner.getTable('sequelize_meta')
    if (typeof sequelizeMigrationTable !== 'undefined') {
      // The schema is already up-to-date because Sequelize was used before,
      // so delete the Sequelize migration table and skip all other migrations.
      // If the database is migrated from nothing, this if statement will not
      // run.
      return await queryRunner.dropTable('sequelize_meta')
    }

    await queryRunner.createTable(new Table({
      name: 'channels',
      columns: [{
        name: 'id',
        type: 'bigint',
        isPrimary: true
      }, {
        name: 'guild_id',
        type: 'bigint'
      }]
    }))
    await queryRunner.createTable(new Table({
      name: 'messages',
      columns: [{
        name: 'id',
        type: 'bigint',
        isPrimary: true
      }, {
        name: 'guild_id',
        type: 'bigint'
      }, {
        name: 'channel_id',
        type: 'bigint'
      }],
      foreignKeys: [{
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE'
      }]
    }))
    await Promise.all([
      queryRunner.createTable(new Table({
        name: 'roles',
        columns: [{
          name: 'id',
          type: 'bigint',
          isPrimary: true
        }, {
          name: 'guild_id',
          type: 'bigint'
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'members',
        columns: [{
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true
        }, {
          name: 'user_id',
          type: 'bigint'
        }, {
          name: 'guild_id',
          type: 'bigint'
        }],
        indices: [{
          columnNames: ['guild_id', 'user_id'],
          isUnique: true
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'emojis',
        columns: [{
          name: 'id',
          type: 'bigint',
          isPrimary: true
        }, {
          name: 'guild_id',
          type: 'bigint'
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'panels',
        columns: [{
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true
        }, {
          name: 'name',
          type: 'varchar(255)'
        }, {
          name: 'content',
          type: 'varchar(7000)'
        }, {
          name: 'message_id',
          type: 'bigint',
          isNullable: true,
          isUnique: true
        }, {
          name: 'guild_id',
          type: 'bigint'
        }],
        foreignKeys: [{
          columnNames: ['message_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'messages',
          onDelete: 'SET NULL'
        }],
        indices: [{
          columnNames: ['guild_id', 'name'],
          isUnique: true
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'groups',
        columns: [{
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true
        }, {
          name: 'name',
          type: 'varchar(255)'
        }, {
          name: 'type',
          type: 'enum',
          enum: ['channel', 'role']
        }, {
          name: 'guarded',
          type: 'bool',
          default: false
        }, {
          name: 'guild_id',
          type: 'bigint'
        }],
        indices: [{
          columnNames: ['guild_id', 'name'],
          isUnique: true
        }]
      }))
    ])

    await queryRunner.createTable(new Table({
      name: 'guilds',
      columns: [{
        name: 'id',
        type: 'bigint',
        isPrimary: true
      }, {
        name: 'support_enabled',
        type: 'bool',
        default: 'false'
      }, {
        name: 'primary_color',
        type: 'int',
        isNullable: true
      }, {
        name: 'command_prefix',
        type: 'varchar(255)',
        isNullable: true
      }, {
        name: 'roblox_group_id',
        type: 'int',
        isNullable: true
      }, {
        name: 'logs_channel_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'suggestions_channel_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'ratings_channel_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'tickets_category_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'ticket_archives_channel_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'verification_preference',
        type: 'enum',
        enum: ['rover', 'bloxlink'],
        default: '\'rover\'' // https://github.com/typeorm/typeorm/issues/5335
      }, {
        name: 'roblox_usernames_in_nicknames',
        type: 'bool',
        default: false
      }],
      foreignKeys: [{
        columnNames: ['logs_channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['suggestions_channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['ratings_channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['tickets_category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['ticket_archives_channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }]
    }))

    await Promise.all([
      createGuildIdForeignKey(queryRunner, 'roles'),
      createGuildIdForeignKey(queryRunner, 'channels'),
      createGuildIdForeignKey(queryRunner, 'messages'),
      createGuildIdForeignKey(queryRunner, 'members'),
      createGuildIdForeignKey(queryRunner, 'emojis'),
      createGuildIdForeignKey(queryRunner, 'panels'),
      createGuildIdForeignKey(queryRunner, 'groups')
    ])

    await queryRunner.createTable(new Table({
      name: 'commands',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'name',
        type: 'varchar(255)'
      }, {
        name: 'type',
        type: 'enum',
        enum: ['command', 'group']
      }],
      indices: [{
        columnNames: ['name', 'type'],
        isUnique: true
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'guilds_commands',
      columns: [{
        name: 'guild_id',
        type: 'bigint',
        isPrimary: true
      }, {
        name: 'command_id',
        type: 'int',
        isPrimary: true
      }, {
        name: 'enabled',
        type: 'bool'
      }],
      foreignKeys: [{
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['command_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'commands',
        onDelete: 'CASCADE'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'tags',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'content',
        type: 'varchar(7000)'
      }, {
        name: 'guild_id',
        type: 'bigint'
      }],
      foreignKeys: [{
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
      }]
    }))
    await queryRunner.createTable(new Table({
      name: 'tag_names',
      columns: [{
        name: 'name',
        type: 'varchar(255)',
        isPrimary: true
      }, {
        name: 'tag_id',
        type: 'int',
        isPrimary: true
      }],
      foreignKeys: [{
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'ticket_types',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'name',
        type: 'varchar(16)'
      }, {
        name: 'guild_id',
        type: 'bigint'
      }, {
        name: 'emoji',
        type: 'varchar(255)',
        isNullable: true
      }, {
        name: 'emoji_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'message_id',
        type: 'bigint',
        isNullable: true
      }],
      foreignKeys: [{
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['emoji_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'emojis',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['message_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'messages',
        onDelete: 'SET NULL'
      }],
      indices: [{
        columnNames: ['guild_id', 'name'],
        isUnique: true
      }]
    }))

    await createExclusiveArcOrNoneConstraint(queryRunner, 'ticket_types', ['emoji', 'emoji_id'])

    await queryRunner.createTable(new Table({
      name: 'tickets',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'type_id',
        type: 'int',
        isNullable: true
      }, {
        name: 'author_id',
        type: 'int'
      }, {
        name: 'channel_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'guild_id',
        type: 'bigint'
      }],
      foreignKeys: [{
        columnNames: ['type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ticket_types',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'members',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL'
      }, {
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
      }],
      indices: [{
        columnNames: ['channel_id', 'guild_id'],
        isUnique: true,
        where: `${driver.escape('channel_id')} IS NOT NULL`
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'tickets_moderators',
      columns: [{
        name: 'ticket_id',
        type: 'int',
        isPrimary: true
      }, {
        name: 'member_id',
        type: 'int',
        isPrimary: true
      }],
      foreignKeys: [{
        columnNames: ['ticket_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tickets',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['member_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'members',
        onDelete: 'CASCADE'
      }]
    }))

    await Promise.all([
      queryRunner.createTable(new Table({
        name: 'members_roles',
        columns: [{
          name: 'member_id',
          type: 'int',
          isPrimary: true
        }, {
          name: 'role_id',
          type: 'bigint',
          isPrimary: true
        }],
        foreignKeys: [{
          columnNames: ['member_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'members',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE'
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'role_bindings',
        columns: [{
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true
        }, {
          name: 'min',
          type: 'int'
        }, {
          name: 'max',
          type: 'int',
          isNullable: true
        }, {
          name: 'role_id',
          type: 'bigint'
        }, {
          name: 'roblox_group_id',
          type: 'int'
        }, {
          name: 'guild_id',
          type: 'bigint'
        }],
        foreignKeys: [{
          columnNames: ['role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['guild_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'guilds',
          onDelete: 'CASCADE'
        }],
        indices: [{
          columnNames: ['guild_id', 'max', 'min', 'roblox_group_id', 'role_id'],
          isUnique: true
        }, {
          columnNames: ['guild_id', 'min', 'roblox_group_id', 'role_id'],
          isUnique: true,
          where: `${driver.escape('max')} IS NULL`
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'role_messages',
        columns: [{
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true
        }, {
          name: 'emoji',
          type: 'varchar(255)',
          isNullable: true
        }, {
          name: 'emoji_id',
          type: 'bigint',
          isNullable: true
        }, {
          name: 'role_id',
          type: 'bigint'
        }, {
          name: 'message_id',
          type: 'bigint'
        }, {
          name: 'guild_id',
          type: 'bigint'
        }],
        foreignKeys: [{
          columnNames: ['emoji_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'emojis',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['message_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'messages',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['guild_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'guilds',
          onDelete: 'CASCADE'
        }],
        indices: [{
          columnNames: ['emoji', 'emoji_id', 'guild_id', 'message_id', 'role_id'],
          isUnique: true
        }, {
          columnNames: ['emoji', 'guild_id', 'message_id', 'role_id'],
          isUnique: true,
          where: `${driver.escape('emoji_id')} IS NULL`
        }, {
          columnNames: ['emoji_id', 'guild_id', 'message_id', 'role_id'],
          isUnique: true,
          where: `${driver.escape('emoji')} IS NULL`
        }]
      }))
    ])

    await createExclusiveArcConstraint(queryRunner, 'role_messages', ['emoji', 'emoji_id'])

    await Promise.all([
      queryRunner.createTable(new Table({
        name: 'channels_channels',
        columns: [{
          name: 'from_channel_id',
          type: 'bigint',
          isPrimary: true
        }, {
          name: 'to_channel_id',
          type: 'bigint',
          isPrimary: true
        }],
        foreignKeys: [{
          columnNames: ['from_channel_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'channels',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['to_channel_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'channels',
          onDelete: 'CASCADE'
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'channels_groups',
        columns: [{
          name: 'channel_id',
          type: 'bigint',
          isPrimary: true
        }, {
          name: 'group_id',
          type: 'int',
          isPrimary: true
        }],
        foreignKeys: [{
          columnNames: ['channel_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'channels',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['group_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'groups',
          onDelete: 'CASCADE'
        }]
      })),
      queryRunner.createTable(new Table({
        name: 'roles_groups',
        columns: [{
          name: 'role_id',
          type: 'bigint',
          isPrimary: true
        }, {
          name: 'group_id',
          type: 'int',
          isPrimary: true
        }],
        foreignKeys: [{
          columnNames: ['role_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'CASCADE'
        }, {
          columnNames: ['group_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'groups',
          onDelete: 'CASCADE'
        }]
      }))
    ])

    await queryRunner.createTable(new Table({
      name: 'permissions',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'allow',
        type: 'bool'
      }, {
        name: 'command_id',
        type: 'int'
      }, {
        name: 'role_id',
        type: 'bigint',
        isNullable: true
      }, {
        name: 'group_id',
        type: 'int',
        isNullable: true
      }],
      foreignKeys: [{
        columnNames: ['command_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'commands',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['group_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'groups',
        onDelete: 'CASCADE'
      }],
      indices: [{
        columnNames: ['command_id', 'group_id', 'role_id'],
        isUnique: true
      }, {
        columnNames: ['command_id', 'group_id'],
        isUnique: true,
        where: `${driver.escape('role_id')} IS NULL`
      }, {
        columnNames: ['command_id', 'role_id'],
        isUnique: true,
        where: `${driver.escape('group_id')} IS NULL`
      }]
    }))

    await createExclusiveArcConstraint(queryRunner, 'permissions', ['role_id', 'group_id'])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('permissions')

    await Promise.all([
      queryRunner.dropTable('roles_groups'),
      queryRunner.dropTable('channels_groups'),
      queryRunner.dropTable('channels_channels')
    ])

    await Promise.all([
      queryRunner.dropTable('role_messages'),
      queryRunner.dropTable('role_bindings'),
      queryRunner.dropTable('members_roles')
    ])

    await queryRunner.dropTable('tickets_moderators')
    await queryRunner.dropTable('tickets')

    await queryRunner.dropTable('ticket_types')

    await queryRunner.dropTable('tag_names')
    await queryRunner.dropTable('tags')

    await queryRunner.dropTable('guilds_commands')
    await queryRunner.dropTable('commands')

    await Promise.all([
      queryRunner.dropForeignKey('groups', await getGuildIdForeignKey(queryRunner, 'groups')),
      queryRunner.dropForeignKey('panels', await getGuildIdForeignKey(queryRunner, 'panels')),
      queryRunner.dropForeignKey('emojis', await getGuildIdForeignKey(queryRunner, 'emojis')),
      queryRunner.dropForeignKey('members', await getGuildIdForeignKey(queryRunner, 'members')),
      queryRunner.dropForeignKey('messages', await getGuildIdForeignKey(queryRunner, 'messages')),
      queryRunner.dropForeignKey('channels', await getGuildIdForeignKey(queryRunner, 'channels')),
      queryRunner.dropForeignKey('roles', await getGuildIdForeignKey(queryRunner, 'roles'))
    ])

    await queryRunner.dropTable('guilds')

    await Promise.all([
      queryRunner.dropTable('groups'),
      queryRunner.dropTable('panels'),
      queryRunner.dropTable('emojis'),
      queryRunner.dropTable('members'),
      queryRunner.dropTable('roles')
    ])
    await queryRunner.dropTable('messages')
    await queryRunner.dropTable('channels')
  }
}

async function getGuildIdForeignKey (queryRunner: QueryRunner, tableName: string): Promise<TableForeignKey> {
  const table = await queryRunner.getTable(tableName)
  return table?.foreignKeys.find(fk => fk.columnNames.includes('guild_id')) as TableForeignKey
}

async function createGuildIdForeignKey (queryRunner: QueryRunner, tableName: string): Promise<void> {
  return await queryRunner.createForeignKey(tableName, new TableForeignKey({
    columnNames: ['guild_id'],
    referencedColumnNames: ['id'],
    referencedTableName: 'guilds',
    onDelete: 'CASCADE'
  }))
}

async function createExclusiveArcConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[]
): Promise<void> {
  return await createCardinalityConstraint(queryRunner, tableName, columns, '= 1')
}

async function createExclusiveArcOrNoneConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[]
): Promise<void> {
  return await createCardinalityConstraint(queryRunner, tableName, columns, '<= 1')
}

async function createCardinalityConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[],
  condition: string
): Promise<void> {
  const driver = queryRunner.connection.driver
  return await queryRunner.createCheckConstraint(tableName, new TableCheck({
    expression: `(${columns.map(column => `(${driver.escape(column)} IS NOT NULL)::INTEGER`).join(' +\n')}) ${condition}`
  }))
}
