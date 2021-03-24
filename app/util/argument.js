'use strict'
const { MessageMentions } = require('discord.js')
const { getDateInfo } = require('./time')

const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
const dateRegex = /(([0-2]?[0-9]|3[0-1])[-](0?[1-9]|1[0-2])[-][0-9]{4})/
const timeRegex = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/

function validators (steps = []) {
  if (steps.length === 0) {
    return
  }
  return async function (val, msg) {
    steps.unshift(this.type.validate)
    for (const step of steps) {
      if (step instanceof Array) {
        let results = step.map(validator => validator.call(this.type, val, msg, this))
        results = await Promise.allSettled(results)
        if (results.some(result => result.value && typeof result.value !== 'string')) {
          continue
        }

        const errors = results.filter(result => typeof result.value === 'string').map(result => result.value)
        if (errors.length > 0) {
          return errors.join('\n')
        }
        throw results.find(result => result.status === 'rejected').reason
      } else {
        const valid = await step.call(this.type, val, msg, this)
        if (!valid || typeof valid === 'string') {
          return valid
        }
      }
    }
    return true
  }
}

function makeValidator (test, message) {
  return function (val, msg, arg) {
    return !test.call(this, val, msg, arg) || `\`${arg.label ?? msg}\` ${message}.`
  }
}

const isSnowflake = makeValidator(/^[0-9]+$/.test, 'must be a Snowflake ID')
const noChannels = makeValidator(MessageMentions.CHANNELS_PATTERN.test, 'cannot contain channels')
const noNumber = makeValidator(val => !isNaN(parseInt(val)), 'cannot be a number')
const noSpaces = makeValidator(val => val.includes(' '), 'cannot contain spaces')
const noUrls = makeValidator(urlRegex.test, 'cannot contain URLs')

const isObject = makeValidator(
  val => {
    try {
      return Object.prototype.toString.call(JSON.parse(val)) !== '[object Object]'
    } catch {
      return false
    }
  },
  'must be an object'
)

const noTags = makeValidator(
  val => MessageMentions.EVERYONE_PATTERN.test(val) || MessageMentions.USERS_PATTERN.test(val) || MessageMentions
    .ROLES_PATTERN.test(val),
  'cannot contain tags'
)

function typeOf (type) {
  return makeValidator(
    async function (val, msg, arg) {
      return typeof await this.parse(val, msg, arg) === type // eslint-disable-line valid-typeof
    },
    `must be a ${type}`
  )
}

function validDate (dateString) {
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

function validTime (timeString) {
  return timeRegex.test(timeString)
}

function validateNoneOrType (val, msg, arg) {
  return val === 'none' || this.type.validate(val, msg, arg)
}

function parseNoneOrType (val, msg, arg) {
  return val === 'none' ? undefined : this.type.parse(val, msg, arg)
}

module.exports = {
  isObject,
  isSnowflake,
  noChannels,
  noNumber,
  noSpaces,
  noTags,
  noUrls,
  parseNoneOrType,
  typeOf,
  validateNoneOrType,
  validators,
  validDate,
  validTime
}
