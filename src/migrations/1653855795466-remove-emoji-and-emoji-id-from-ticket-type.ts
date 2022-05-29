import { type MigrationInterface, type QueryRunner, type Table, TableColumn, TableForeignKey } from 'typeorm'

export class removeEmojiAndEmojiIdFromTicketType1653855795466 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ticket_types') as Table
    const foreignKey =
      table.foreignKeys.find(foreignKey => foreignKey.columnNames.includes('emoji_id')) as TableForeignKey
    await queryRunner.dropForeignKey(table, foreignKey)
    await queryRunner.dropColumns(table, ['emoji', 'emoji_id'])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ticket_types') as Table
    await queryRunner.addColumns(table, [
      new TableColumn({
        name: 'emoji',
        type: 'varchar(255)',
        isNullable: true
      }),
      new TableColumn({
        name: 'emoji_id',
        type: 'bigint',
        isNullable: true
      })
    ])
    await queryRunner.createForeignKey(
      table,
      new TableForeignKey({
        columnNames: ['emoji_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'emojis',
        onDelete: 'SET NULL'
      })
    )
  }
}
