import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import type { Role } from '../entities'
import { RoleBinding } from '../entities'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class RoleBindingSubscriber implements EntitySubscriberInterface<RoleBinding> {
  @inject(TYPES.RoleRepository) private readonly roleRepository!: Repository<Role>

  public listenTo (): Function {
    return RoleBinding
  }

  public async beforeInsert (event: InsertEvent<RoleBinding>): Promise<void> {
    const entity = this.roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId })
    if (typeof await this.roleRepository.findOne(entity) === 'undefined') {
      await this.roleRepository.save(entity)
    }
  }
}
