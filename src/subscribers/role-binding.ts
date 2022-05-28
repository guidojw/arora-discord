import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'
import { Role, RoleBinding } from '../entities'

@EventSubscriber()
export class RoleBindingSubscriber implements EntitySubscriberInterface<RoleBinding> {
  public listenTo (): Function {
    return RoleBinding
  }

  public async beforeInsert (event: InsertEvent<RoleBinding>): Promise<void> {
    const roleRepository = event.manager.getRepository(Role)
    const fields = { id: event.entity.roleId, guildId: event.entity.guildId }
    if (await roleRepository.findOneBy(fields) === null) {
      await roleRepository.save(roleRepository.create(fields))
    }
  }
}
