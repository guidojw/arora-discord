import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'
import { Permission, Role } from '../entities'

@EventSubscriber()
export class PermissionSubscriber implements EntitySubscriberInterface<Permission> {
  public listenTo (): Function {
    return Permission
  }

  public async beforeInsert (event: InsertEvent<Permission>): Promise<void> {
    const roleRepository = event.manager.getRepository(Role)
    if (event.entity.roleId != null) {
      const entity = roleRepository.create({ id: event.entity.roleId, guildId: event.queryRunner.data.guildId })
      if (typeof await roleRepository.findOne(entity) === 'undefined') {
        await roleRepository.save(entity)
      }
    }
  }
}
