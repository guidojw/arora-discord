import { type Constructor, createClassDecorator, createProxy } from './util'
import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator'

/**
 * Applies given options to the class' constructor.
 */
export function ApplyOptions<T extends object> (options: T): ClassDecorator {
  return createClassDecorator((target: Constructor<any>) => (
    createProxy(target, {
      construct: (ctor, [client, baseOptions = {}]) => (
        // eslint-disable-next-line new-cap
        new ctor(client, {
          ...baseOptions,
          ...options
        })
      )
    })
  ))
}

/**
 * Used to mark a XOR relation between given and specified properties.
 */
export function Xor (
  property: string,
  validationOptions?: ValidationOptions
): (object: Object, propertyName: string) => void {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'xor',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate (value: any, args: ValidationArguments): boolean {
          const relatedValue = (args.object as any)[args.constraints[0]]
          return (value != null && relatedValue == null) || (value == null && relatedValue != null)
        },
        defaultMessage (args: ValidationArguments): string {
          return `Failed XOR relation between "${args.property}" and "${args.constraints[0] as string}".`
        }
      }
    })
  }
}

/**
 * Used to mark a NAND relation between given and specified properties.
 */
export function Nand (
  property: string,
  validationOptions?: ValidationOptions
): (object: Object, propertyName: string) => void {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'nand',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate (value: any, args: ValidationArguments): boolean {
          const relatedValue = (args.object as any)[args.constraints[0]]
          return !(value != null && relatedValue != null)
        },
        defaultMessage (args: ValidationArguments): string {
          return `Failed NAND relation between "${args.property}" and "${args.constraints[0] as string}".`
        }
      }
    })
  }
}
