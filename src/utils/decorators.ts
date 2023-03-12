import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator'
import type { Constructor } from '.'
import { createClassDecorator } from './util'

/**
 * Applies given options to the class.
 */
export function ApplyOptions<T extends object> (options: T): ClassDecorator {
  return createClassDecorator((target: Constructor<any>) => {
    // Using Reflect.defineMetadata instead of a Proxy because Proxy's
    // handler.construct doesn't work when Inversify creates an instance.
    Reflect.defineMetadata('options', options, target)
  })
}

/**
 * Used to mark a XOR relation between given and specified properties.
 */
export function Xor (
  property: string,
  validationOptions?: ValidationOptions
): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string) {
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
): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string) {
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
