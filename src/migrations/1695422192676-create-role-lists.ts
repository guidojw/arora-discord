import { type MigrationInterface, type QueryRunner, Table, TableCheck } from 'typeorm'

export class createRoleLists1695422192676 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'role_lists',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'name',
        type: 'varchar(255)'
      }, {
        name: 'guild_id',
        type: 'bigint'
      }, {
        name: 'message_id',
        type: 'bigint',
        isNullable: true,
        isUnique: true
      }],
      foreignKeys: [{
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
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
    await queryRunner.createTable(new Table({
      name: 'roles_role_lists',
      columns: [{
        name: 'role_id',
        type: 'bigint',
        isPrimary: true
      }, {
        name: 'role_list_id',
        type: 'int',
        isPrimary: true
      }, {
        name: 'emoji_name',
        type: 'varchar(255)',
        isNullable: true
      }, {
        name: 'emoji_id',
        type: 'bigint',
        isNullable: true
      }],
      foreignKeys: [{
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['role_list_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'role_lists',
        onDelete: 'CASCADE'
      }, {
        columnNames: ['emoji_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'emojis',
        onDelete: 'SET NULL'
      }]
    }))

    await createExclusiveArcOrNoneConstraint(queryRunner, 'roles_role_lists', ['emoji_name', 'emoji_id'])

    await queryRunner.query(`INSERT INTO role_lists (name, guild_id, message_id)
SELECT DISTINCT concat('message:', message_id), guild_id, message_id
FROM role_messages`)
    await queryRunner.query(`INSERT INTO roles_role_lists (role_id, role_list_id, emoji_name, emoji_id)
SELECT r.role_id, l.id, r.emoji, r.emoji_id
FROM role_messages r, role_lists l
WHERE l.message_id = r.message_id`)

    await queryRunner.dropTable('role_messages')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver

    await queryRunner.createTable(new Table({
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

    await createExclusiveArcConstraint(queryRunner, 'role_messages', ['emoji', 'emoji_id'])

    await queryRunner.query(`INSERT INTO role_messages (emoji, emoji_id, role_id, message_id, guild_id)
SELECT r.emoji_name, r.emoji_id, r.role_id, l.message_id, l.guild_id
FROM roles_role_lists r, role_lists l
WHERE r.role_list_id = l.id`)

    await queryRunner.dropTable('roles_role_lists')
    await queryRunner.dropTable('role_lists')
  }
}

async function createExclusiveArcConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[]
): Promise<void> {
  await createCardinalityConstraint(queryRunner, tableName, columns, '= 1')
}

async function createExclusiveArcOrNoneConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[]
): Promise<void> {
  await createCardinalityConstraint(queryRunner, tableName, columns, '<= 1')
}

async function createCardinalityConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[],
  condition: string
): Promise<void> {
  const driver = queryRunner.connection.driver
  await queryRunner.createCheckConstraint(tableName, new TableCheck({
    expression: `(${columns.map(column => `(${driver.escape(column)} IS NOT NULL)::INTEGER`).join(' +\n')}) ${condition}`
  }))
}
