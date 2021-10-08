import type { Argument, ParserFunction, ValidatorFunction } from '../commands'
import type { CommandInteraction } from 'discord.js'
import type { Enum } from './util'
import { MessageMentions } from 'discord.js'
import { getDateInfo } from './time'
import { getEnumKeys } from './util'

type ValidatorTest =
((val: string, interaction: CommandInteraction, arg: Argument<any>) => boolean | Promise<boolean>)

const dateRegex = /(([0-2]?[0-9]|3[0-1])[-](0?[1-9]|1[0-2])[-][0-9]{4})/
const timeRegex = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/

export const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

export function validators (
  steps: Array<ValidatorFunction<any> | Array<ValidatorFunction<any>>> = []
): ValidatorFunction<any> {
  return async function (this: Argument<any>, val, interaction) {
    const valid = await this.type?.validate(val, interaction, this) ?? true
    if (valid !== true) {
      return valid
    }

    if (steps.length === 0) {
      return true
    }
    for (const step of steps) {
      if (step instanceof Array) {
        const validations = step.map(validator => validator.call(this, val, interaction, this))
        const results = await Promise.allSettled(validations)
        if (results.some(result => result.status === 'fulfilled' && result.value === true)) {
          continue
        }

        const errors = results
          .filter(result => result.status === 'fulfilled' && typeof result.value === 'string')
          .map(result => (result as PromiseFulfilledResult<string>).value)
        if (errors.length > 0) {
          return errors.join('\n')
        }
        throw (results.find(result => result.status === 'rejected') as PromiseRejectedResult).reason
      } else {
        const valid = await step(val, interaction, this)
        if (valid !== true) {
          return valid
        }
      }
    }
    return true
  }
}

function makeValidator (test: ValidatorTest, message: string): ValidatorFunction<any> {
  return async function (val, interaction, arg) {
    return await test(val, interaction, arg) || `\`${arg.name ?? arg.key}\` ${message}.`
  }
}

export const noChannels = makeValidator(
  (val: string) => !MessageMentions.CHANNELS_PATTERN.test(val),
  'cannot contain channels'
)

export const noNumber = makeValidator((val: string) => isNaN(parseInt(val)), 'cannot be a number')

export const noSpaces = makeValidator((val: string) => !val.includes(' '), 'cannot contain spaces')

export const noUrls = makeValidator((val: string) => !urlRegex.test(val), 'cannot contain URLs')

export const isObject = makeValidator(
  (val: string) => {
    try {
      return Object.prototype.toString.call(JSON.parse(val)) === '[object Object]'
    } catch {
      return false
    }
  },
  'must be an object'
)

export const noTags = makeValidator(
  (val: string) => (
    !MessageMentions.EVERYONE_PATTERN.test(val) && !MessageMentions.USERS_PATTERN.test(val) &&
    !MessageMentions.ROLES_PATTERN.test(val)
  ),
  'cannot contain tags'
)

export function typeOf (type: string): ValidatorFunction<any> {
  return makeValidator(
    async function (val, interaction, arg) {
      // eslint-disable-next-line valid-typeof
      return typeof (await arg.type?.parse(val, interaction, arg) ?? val) === type
    },
    `must be a ${type}`
  )
}

export function validDate (dateString: string): boolean {
  if (dateRegex.test(dateString)) {
    const { day, month, year } = getDateInfo(dateString)
    const leapYear = year % 4 === 0
    if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
      return day <= 31
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return day <= 30
    } else if (month === 1) {
      return leapYear ? day <= 29 : day <= 28
    }
  }
  return false
}

export function validTime (timeString: string): boolean {
  return timeRegex.test(timeString)
}

export function parseEnum<T extends Enum> (
  enumLike: T,
  transformer?: (attribute: string) => string
): ParserFunction<string> {
  return function (val) {
    const lowerCaseVal = val.toLowerCase()
    const result = getEnumKeys(enumLike)
      .find(key => (transformer?.(key) ?? key).toLowerCase() === lowerCaseVal)
    if (typeof result !== 'undefined') {
      return result
    }
    throw new Error('Unknown enum value.')
  }
}

export function guildSettingTransformer (value: string): string {
  return value.endsWith('Id') ? value.slice(0, -2) : value
}
