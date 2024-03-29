import type { Enum, EnumKeys } from '.'

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
