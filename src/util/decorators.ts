import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator'

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
