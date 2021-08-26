import type { EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { validate } from 'class-validator'

@EventSubscriber()
export class ValidationSubscriber implements EntitySubscriberInterface {
  public async beforeInsert (event: InsertEvent<any>): Promise<void> {
    await ValidationSubscriber.validate(event.entity)
  }

  public async beforeUpdate (event: UpdateEvent<any>): Promise<void> {
    await ValidationSubscriber.validate(event.entity, true)
  }

  private static async validate (entity: any, skipUndefinedProperties = false): Promise<void> {
    const errors = await validate(entity, { skipUndefinedProperties })
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }
}
