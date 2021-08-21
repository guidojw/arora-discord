import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import type { Permission, Role } from '../entities'
import { EventSubscriber } from 'typeorm'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class PermissionSubscriber implements EntitySubscriberInterface<Permission> {
  @inject(TYPES.RoleRepository) private readonly roleRepository!: Repository<Role>

  public async beforeInsert (event: InsertEvent<Permission>): Promise<void> {
    if (event.entity.roleId != null) {
      const entity = this.roleRepository.create({ id: event.entity.roleId, guildId: event.queryRunner.data.guildId })
      if (typeof await this.roleRepository.findOne(entity) === 'undefined') {
        await this.roleRepository.save(entity)
      }
    }
  }
}
