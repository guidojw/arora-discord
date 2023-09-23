import type { AroraClient } from '..'
import type { QueryRunner } from 'typeorm'

export default interface BaseMigration {
  shouldRun? (client: AroraClient, queryRunner?: QueryRunner): boolean | Promise<boolean>
  run (client: AroraClient, queryRunner?: QueryRunner): void | Promise<void>
  revert (client: AroraClient, queryRunner?: QueryRunner): void | Promise<void>
}
