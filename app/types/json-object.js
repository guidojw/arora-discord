'use strict'
const { ArgumentType } = require('discord.js-commando')

class JsonObjectArgumentType extends ArgumentType {
  constructor (client) {
    super(client, 'json-object')
  }

  validate (val, _msg, arg) {
    try {
      JSON.parse(val)
    } catch (err) {
      return false
    }
    if (arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
      return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`
    }
    if (arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
      return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`
    }
    return true
  }

  parse (val) {
    return JSON.parse(val)
  }
}

module.exports = JsonObjectArgumentType
