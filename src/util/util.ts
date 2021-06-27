import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

export type Constructor<T = {}> = new (...args: any[]) => T
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T

export function formatBytes (bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getAbbreviation (val: string): string {
  return val
    .trim()
    .split(/ +/)
    .map(word => word.charAt(0))
    .join('')
}

export function getOrdinalNum (number: number): string {
  let selector
  if (number < 0) {
    selector = 4
  } else if ((number > 3 && number < 21) || number % 10 > 3) {
    selector = 0
  } else {
    selector = number % 10
  }
  return `${number} ${['th', 'st', 'nd', 'rd', ''][selector]}`
}

export function makeCommaSeparatedString (array: string[]): string {
  if (array.length <= 1) {
    return array[0] ?? ''
  }
  const firsts = array.slice(0, array.length - 1)
  const last = array[array.length - 1]
  return `${firsts.join(', ')} & ${last}`
}

export function split<T> (array: T[], length: number): T[][] {
  return array.reduce<T[][]>((result, item, index) => {
    const chunk = Math.floor(index / length)
    if (typeof result[chunk] === 'undefined') {
      result[chunk] = []
    }
    result[chunk].push(item)
    return result
  }, [])
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
