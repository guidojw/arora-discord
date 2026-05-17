import type { AroraClient } from '..'
import type { QueryRunner } from 'typeorm'

export default interface BaseMigration {
  shouldRun? (client: AroraClient<true>, queryRunner?: QueryRunner): boolean | Promise<boolean>
  run (client: AroraClient<true>, queryRunner?: QueryRunner): void | Promise<void>
  revert (client: AroraClient<true>, queryRunner?: QueryRunner): void | Promise<void>
}
