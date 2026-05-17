import { type MigrationInterface, type QueryRunner, TableColumn } from 'typeorm'

export class RemoveVerificationPreferenceFromGuild1778770574407 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guilds', 'verification_preference')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('guilds', new TableColumn({
      name: 'verification_preference',
      type: 'enum',
      enum: ['rover', 'bloxlink'],
      default: '\'rover\'' // https://github.com/typeorm/typeorm/issues/5335
    }))
  }
}
