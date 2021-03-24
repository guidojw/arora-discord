'use strict'
const { MessageMentions } = require('discord.js')

// eslint-disable-next-line max-len
const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

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
    return !test.call(this, val, msg, arg) || `\`${arg.label}\` ${message}.`
  }
}

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

function typeOf (type, message) {
  return makeValidator(
    async function (val, msg, arg) {
      return typeof await this.parse(val, msg, arg) === type
    },
    `must be ${message}`
  )
}

module.exports = {
  validators,
  isObject,
  noChannels,
  noNumber,
  noSpaces,
  noTags,
  noUrls,
  typeOf
}
