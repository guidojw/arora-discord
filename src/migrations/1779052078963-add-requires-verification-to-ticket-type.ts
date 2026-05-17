import { type MigrationInterface, type QueryRunner, TableColumn } from 'typeorm'

export class addRequiresVerificationToTicketType1779052078963 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('ticket_types', new TableColumn({
      name: 'requires_verification',
      type: 'bool',
      default: false
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('ticket_types', 'requires_verification')
  }
}
