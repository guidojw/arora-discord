import { type MigrationInterface, type QueryRunner, Table, TableCheck } from 'typeorm'

export class removePermissionsAndCommands1652726153527 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('permissions')
    await queryRunner.dropTable('guilds_commands')
    await queryRunner.dropTable('commands')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver

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
}

async function createExclusiveArcConstraint (
  queryRunner: QueryRunner,
  tableName: string,
  columns: string[]
): Promise<void> {
  return await createCardinalityConstraint(queryRunner, tableName, columns, '= 1')
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
