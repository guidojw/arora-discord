import type { EntitySubscriberInterface, InsertEvent } from 'typeorm'
import { Role, RoleBinding } from '../entities'
import { EventSubscriber } from 'typeorm'

@EventSubscriber()
export class RoleBindingSubscriber implements EntitySubscriberInterface<RoleBinding> {
  public listenTo (): Function {
    return RoleBinding
  }

  public async beforeInsert (event: InsertEvent<RoleBinding>): Promise<void> {
    const roleRepository = event.manager.getRepository(Role)
    const entity = roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId })
    if (typeof await roleRepository.findOne(entity) === 'undefined') {
      await roleRepository.save(entity)
    }
  }
}
