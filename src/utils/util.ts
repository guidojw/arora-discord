export type Constructor<T = {}> = new (...args: any[]) => T
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>
export type Enum = Record<string, number | string>
export type KeyOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
export type AnyFunction<T = any> = (...input: any[]) => T

export type OverloadedParameters<T> = Overloads<T> extends infer U
  ? { [K in keyof U]: Parameters<Extract<U[K], (...args: any) => any>> }
  : never

export type OverloadedReturnType<T> = Overloads<T> extends infer U
  ? { [K in keyof U]: ReturnType<Extract<U[K], (...args: any) => any>> }
  : never

// Supports up to 4 overload signatures.
type Overloads<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
} ? [
      (...args: A1) => R1,
      (...args: A2) => R2,
      (...args: A3) => R3,
      (...args: A4) => R4
    ] : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    } ? [
          (...args: A1) => R1,
          (...args: A2) => R2,
          (...args: A3) => R3
        ] : T extends {
          (...args: infer A1): infer R1
          (...args: infer A2): infer R2
        } ? [
              (...args: A1) => R1,
              (...args: A2) => R2
            ] : T extends (...args: infer A1) => infer R1
              ? [(...args: A1) => R1]
              : any

type EnumKeys<T extends Enum> = Exclude<keyof T, number>

function getEnumObject<T extends Enum> (
  enumLike: T
): { [K in EnumKeys<T>]: T[K] } {
  const copy = { ...enumLike }
  Object.values(enumLike)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    .forEach(value => typeof value === 'number' && delete copy[value])
  return copy
}

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
    .split(/\s+/)
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
  return `${number}${['th', 'st', 'nd', 'rd', ''][selector]}`
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

export function getEnumKeys<T extends Enum> (enumLike: T): string[] {
  return Object.keys(getEnumObject(enumLike))
}

export function getEnumValues<T extends Enum> (enumLike: T): Array<string | number> {
  return [...new Set(Object.values(getEnumObject(enumLike)))]
}

export function createClassDecorator<TFunction extends (...args: any[]) => void> (fn: TFunction): ClassDecorator {
  return fn
}

export function createProxy<T extends object> (target: T, handler: Omit<ProxyHandler<T>, 'get'>): T {
  return new Proxy(target, {
    ...handler,
    get: (target, property) => {
      const value = Reflect.get(target, property)
      return typeof value === 'function' ? (...args: readonly unknown[]) => value.apply(target, args) : value
    }
  })
}