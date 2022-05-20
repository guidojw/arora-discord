import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent, type UpdateEvent } from 'typeorm'
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
    if (typeof entity === 'undefined') {
      return
    }

    const errors = await validate(entity, { skipUndefinedProperties })
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }
}
