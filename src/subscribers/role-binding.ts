import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'
import { Role, RoleBinding } from '../entities'

@EventSubscriber()
export class RoleBindingSubscriber implements EntitySubscriberInterface<RoleBinding> {
  public listenTo (): Function {
    return RoleBinding
  }

  public async beforeInsert (event: InsertEvent<RoleBinding>): Promise<void> {
    const roleRepository = event.manager.getRepository(Role)
    if (await roleRepository.findOneBy({ id: event.entity.roleId }) === null) {
      await roleRepository.save(roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId }))
    }
  }
}
