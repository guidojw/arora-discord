import { type MigrationInterface, type QueryRunner, Table } from 'typeorm'

export class createInfractions1778363531403 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'infractions',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'guild_id',
        type: 'int'
      }, {
        name: 'user_id',
        type: 'int'
      }, {
        name: 'author_id',
        type: 'int'
      }, {
        name: 'type',
        type: 'enum',
        enum: ['warn', 'kick', 'ban', 'mute']
      }, {
        name: 'active',
        type: 'bool',
        default: true
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }],
      foreignKeys: [{
        columnNames: ['guild_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'guilds',
        onDelete: 'CASCADE'
      }]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('infractions')
  }
}
