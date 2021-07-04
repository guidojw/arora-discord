import type { EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { validate } from 'class-validator'

@EventSubscriber()
export class ValidationSubscriber implements EntitySubscriberInterface {
  public async beforeInsert (event: InsertEvent<any>): Promise<void> {
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }

  public async beforeUpdate (event: UpdateEvent<any>): Promise<void> {
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }
}
