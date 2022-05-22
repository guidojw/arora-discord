import type { IdentifiableEntity } from '../entities'
import { injectable } from 'inversify'

export interface IdentifiableStructure<
  T extends number | string,
  U extends IdentifiableEntity
  > extends BaseStructure<U> {
  id: T
  toString (): string
}

@injectable()
export default abstract class BaseStructure<T extends IdentifiableEntity> {
  public abstract setOptions (data: T, ...extras: unknown[]): void

  public abstract setup (data: any): void
}
